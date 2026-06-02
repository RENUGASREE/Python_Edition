/** Default OpenRouter model — free tier. Override with AI_MODEL on Render. */
const OPENROUTER_DEFAULT_MODEL = "meta-llama/llama-3.2-3b-instruct:free";

/** Tried in order if the primary model returns 404 (deprecated/removed on OpenRouter). */
const OPENROUTER_FALLBACK_MODELS = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

const DEFAULTS = {
  provider: process.env.AI_PROVIDER || "auto", // auto | openrouter | openai | gemini
  model: process.env.AI_MODEL || "",
  temperature: Number(process.env.AI_TEMPERATURE || "0.4"),
  maxTokens: Number(process.env.AI_MAX_TOKENS || "900"),
};

function trimKey(value) {
  return typeof value === "string" ? value.trim() : "";
}

function pickProvider() {
  const forced = (process.env.AI_PROVIDER || "auto").toLowerCase();
  if (forced === "openai" && trimKey(process.env.OPENAI_API_KEY)) return "openai";
  if (forced === "openrouter" && (trimKey(process.env.OPENROUTER_API_KEY) || trimKey(process.env.OPENAI_API_KEY))) {
    return "openrouter";
  }
  if (forced === "gemini" && trimKey(process.env.GEMINI_API_KEY)) return "gemini";
  if (forced !== "auto") return forced;

  if (trimKey(process.env.OPENROUTER_API_KEY)) return "openrouter";
  if (trimKey(process.env.GEMINI_API_KEY)) return "gemini";
  if (trimKey(process.env.OPENAI_API_KEY)) return "openai";
  return null;
}

function getConfig() {
  const provider = pickProvider();
  if (!provider) {
    return { provider: null, apiKey: null, baseUrl: null, model: null };
  }

  if (provider === "gemini") {
    return {
      provider: "gemini",
      apiKey: trimKey(process.env.GEMINI_API_KEY),
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      model: process.env.AI_MODEL || "gemini-2.0-flash",
      temperature: DEFAULTS.temperature,
      maxTokens: DEFAULTS.maxTokens,
    };
  }

  if (provider === "openai") {
    return {
      provider: "openai",
      apiKey: trimKey(process.env.OPENAI_API_KEY),
      baseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
      model: process.env.AI_MODEL || "gpt-4o-mini",
      temperature: DEFAULTS.temperature,
      maxTokens: DEFAULTS.maxTokens,
    };
  }

  return {
    provider: "openrouter",
    apiKey: trimKey(process.env.OPENROUTER_API_KEY) || trimKey(process.env.OPENAI_API_KEY),
    baseUrl: (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/+$/, ""),
    model: process.env.AI_MODEL?.trim() || OPENROUTER_DEFAULT_MODEL,
    temperature: DEFAULTS.temperature,
    maxTokens: DEFAULTS.maxTokens,
  };
}

export function getAiStatus() {
  const cfg = getConfig();
  return {
    enabled: Boolean(cfg.apiKey && cfg.apiKey.length > 8),
    provider: cfg.provider,
    model: cfg.model,
    defaultOpenRouterModel: OPENROUTER_DEFAULT_MODEL,
    hint: cfg.apiKey
      ? `Using ${cfg.provider} model: ${cfg.model}`
      : "Set OPENROUTER_API_KEY on the API Web Service (not the static site), then redeploy",
  };
}

/** Quick live check that the configured provider accepts requests. */
export async function probeAiConnection() {
  const cfg = getConfig();
  if (!cfg.apiKey) {
    return { ok: false, error: "No API key configured on server" };
  }
  try {
    const out = await chatCompletion({
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
    });
    return {
      ok: Boolean(out.text?.trim()),
      provider: out.provider,
      model: out.model,
      sample: out.text?.slice(0, 80) || "",
    };
  } catch (e) {
    return { ok: false, error: e.message || "Probe failed", provider: cfg.provider, model: cfg.model };
  }
}

export function isLlmEnabled() {
  return getAiStatus().enabled;
}

function openRouterModelsToTry(primaryModel) {
  const list = [primaryModel, ...OPENROUTER_FALLBACK_MODELS];
  return [...new Set(list.filter(Boolean))];
}

async function chatOpenAiCompatible(cfg, messages, { stream = false } = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
  };
  if (cfg.provider === "openrouter") {
    if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
    if (process.env.OPENROUTER_APP_NAME) headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
  }

  const models =
    cfg.provider === "openrouter" ? openRouterModelsToTry(cfg.model) : [cfg.model];

  let lastBody = "";
  let lastStatus = 0;

  for (const model of models) {
    const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: cfg.temperature,
        max_tokens: cfg.maxTokens,
        stream,
      }),
    });

    if (resp.ok) {
      resp._usedModel = model;
      return resp;
    }

    lastStatus = resp.status;
    lastBody = await resp.text().catch(() => "");

    // Try next model only when this model id is invalid / unavailable
    if (cfg.provider === "openrouter" && resp.status === 404) {
      console.warn(`[ai] OpenRouter model not found: ${model}, trying fallback…`);
      continue;
    }
    break;
  }

  let message = `AI request failed (${lastStatus}): ${lastBody.slice(0, 400)}`;
  if (cfg.provider === "openrouter" && lastStatus === 401) {
    message =
      "OpenRouter rejected your API key (401). Create a new key at https://openrouter.ai/keys, set OPENROUTER_API_KEY on the API service (no quotes), redeploy.";
  }
  if (cfg.provider === "openrouter" && lastStatus === 404) {
    message =
      `No OpenRouter model available (tried: ${models.join(", ")}). Set AI_MODEL=meta-llama/llama-3.2-3b-instruct:free on the API service.`;
  }
  const err = new Error(message);
  err.code = "AI_REQUEST_FAILED";
  throw err;
}

function toGeminiContents(messages) {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  return { system, contents };
}

async function chatGemini(cfg, messages, { stream = false } = {}) {
  const { system, contents } = toGeminiContents(messages);
  const url = `${cfg.baseUrl}/models/${encodeURIComponent(cfg.model)}:${stream ? "streamGenerateContent" : "generateContent"}?key=${cfg.apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: {
        temperature: cfg.temperature,
        maxOutputTokens: cfg.maxTokens,
      },
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    const err = new Error(`Gemini request failed (${resp.status}): ${body.slice(0, 400)}`);
    err.code = "AI_REQUEST_FAILED";
    throw err;
  }

  return resp;
}

export async function chatCompletion({ messages }) {
  const cfg = getConfig();
  if (!cfg.apiKey) {
    const err = new Error("AI provider not configured");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  if (cfg.provider === "gemini") {
    const resp = await chatGemini(cfg, messages, { stream: false });
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    return { provider: cfg.provider, model: cfg.model, text };
  }

  const resp = await chatOpenAiCompatible(cfg, messages, { stream: false });
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  return {
    provider: cfg.provider,
    model: resp._usedModel || cfg.model,
    text: typeof text === "string" ? text : "",
  };
}

/**
 * Stream tokens via SSE to Express response.
 */
export async function streamChatCompletion({ messages, res }) {
  const cfg = getConfig();
  if (!cfg.apiKey) {
    const err = new Error("AI provider not configured");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send("meta", { provider: cfg.provider, model: cfg.model });

  try {
    if (cfg.provider === "gemini") {
      const resp = await chatGemini(cfg, messages, { stream: true });
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() || "";
        for (const line of parts) {
          if (!line.trim() || line === "[" || line === "]" || line === ",") continue;
          const cleaned = line.replace(/^,/, "").trim();
          if (!cleaned.startsWith("{")) continue;
          try {
            const json = JSON.parse(cleaned);
            const chunk = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (chunk) {
              full += chunk;
              send("token", { text: chunk });
            }
          } catch {
            /* partial json in stream */
          }
        }
      }
      send("done", { text: full });
      res.end();
      return { provider: cfg.provider, model: cfg.model, text: full };
    }

    const resp = await chatOpenAiCompatible(cfg, messages, { stream: true });
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          const token = json?.choices?.[0]?.delta?.content || "";
          if (token) {
            full += token;
            send("token", { text: token });
          }
        } catch {
          /* ignore */
        }
      }
    }

    send("done", { text: full });
    res.end();
    return { provider: cfg.provider, model: resp._usedModel || cfg.model, text: full };
  } catch (e) {
    send("error", { message: e.message || "Stream failed" });
    res.end();
    throw e;
  }
}
