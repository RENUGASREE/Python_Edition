const DEFAULTS = {
  provider: process.env.AI_PROVIDER || "openrouter", // openrouter | openai
  model: process.env.AI_MODEL || "openai/gpt-4o-mini",
  temperature: Number(process.env.AI_TEMPERATURE || "0.4"),
  maxTokens: Number(process.env.AI_MAX_TOKENS || "700"),
};

function getConfig() {
  const provider = DEFAULTS.provider;
  const apiKey =
    provider === "openai"
      ? process.env.OPENAI_API_KEY
      : process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  const baseUrl =
    provider === "openai"
      ? process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
      : process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

  return {
    provider,
    apiKey,
    baseUrl,
    model: process.env.AI_MODEL || DEFAULTS.model,
    temperature: DEFAULTS.temperature,
    maxTokens: DEFAULTS.maxTokens,
  };
}

export function isLlmEnabled() {
  const { apiKey } = getConfig();
  return Boolean(apiKey && apiKey.trim().length > 10);
}

export async function chatCompletion({ messages }) {
  const cfg = getConfig();
  if (!cfg.apiKey) {
    const err = new Error("AI provider not configured");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  const url = `${cfg.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
  };

  // Optional OpenRouter attribution headers (safe to omit)
  if (cfg.provider === "openrouter") {
    if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
    if (process.env.OPENROUTER_APP_NAME) headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
  }

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: cfg.temperature,
      max_tokens: cfg.maxTokens,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    const err = new Error(`AI request failed (${resp.status}): ${body.slice(0, 300)}`);
    err.code = "AI_REQUEST_FAILED";
    throw err;
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  return {
    provider: cfg.provider,
    model: cfg.model,
    text: typeof text === "string" ? text : "",
  };
}

