const DEFAULTS = {
  provider: process.env.AI_PROVIDER || "auto", // auto | openrouter | openai | gemini
  model: process.env.AI_MODEL || "",
  temperature: Number(process.env.AI_TEMPERATURE || "0.4"),
  maxTokens: Number(process.env.AI_MAX_TOKENS || "900"),
};

function pickProvider() {
  const forced = (process.env.AI_PROVIDER || "auto").toLowerCase();
  if (forced === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (forced === "openrouter" && (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)) {
    return "openrouter";
  }
  if (forced === "gemini" && process.env.GEMINI_API_KEY) return "gemini";
  if (forced !== "auto") return forced;

  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
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
      apiKey: process.env.GEMINI_API_KEY,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      model: process.env.AI_MODEL || "gemini-2.0-flash",
      temperature: DEFAULTS.temperature,
      maxTokens: DEFAULTS.maxTokens,
    };
  }

  if (provider === "openai") {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
      model: process.env.AI_MODEL || "gpt-4o-mini",
      temperature: DEFAULTS.temperature,
      maxTokens: DEFAULTS.maxTokens,
    };
  }

  return {
    provider: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    baseUrl: (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/+$/, ""),
    model: process.env.AI_MODEL || "openai/gpt-4o-mini",
    temperature: DEFAULTS.temperature,
    maxTokens: DEFAULTS.maxTokens,
  };
}

export function getAiStatus() {
  const cfg = getConfig();
  return {
    enabled: Boolean(cfg.apiKey && cfg.apiKey.trim().length > 8),
    provider: cfg.provider,
    model: cfg.model,
    hint: cfg.apiKey
      ? "AI provider configured"
      : "Set OPENROUTER_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY on the API service",
  };
}

export function isLlmEnabled() {
  return getAiStatus().enabled;
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

  const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: cfg.temperature,
      max_tokens: cfg.maxTokens,
      stream,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    const err = new Error(`AI request failed (${resp.status}): ${body.slice(0, 400)}`);
    err.code = "AI_REQUEST_FAILED";
    throw err;
  }

  return resp;
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
    model: cfg.model,
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
    return { provider: cfg.provider, model: cfg.model, text: full };
  } catch (e) {
    send("error", { message: e.message || "Stream failed" });
    res.end();
    throw e;
  }
}
