import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULTS = {
  temperature: Number(process.env.AI_TEMPERATURE || "0.4"),
  maxTokens: Number(process.env.AI_MAX_TOKENS || "700"),
};

export function isLlmEnabled() {
  return Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENAI_API_KEY
  );
}

export async function chatCompletion({ messages }) {
  if (!isLlmEnabled()) {
    const err = new Error("AI provider not configured. Please set GEMINI_API_KEY in .env");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  // 1. Prioritize Gemini natively (free tier available)
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelStr = process.env.AI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelStr });
    
    // Convert generic chat messages to Gemini's format
    // Gemini wants { role: 'user' | 'model', parts: [{ text: '...' }] }
    // System instruction is handled differently but we can just prepend it to the first user message or use systemInstruction if model supports it
    const systemMsgs = messages.filter(m => m.role === "system");
    const sysPrompt = systemMsgs.map(m => m.content).join("\n\n");
    
    let history = messages.filter(m => m.role !== "system").map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    if (history.length === 0) {
      history = [{ role: "user", parts: [{ text: "Hello" }] }];
    }

    // Inject system prompt into the first user message
    if (sysPrompt && history[0].role === "user") {
      history[0].parts[0].text = `[System Instructions]\n${sysPrompt}\n\n[User Message]\n${history[0].parts[0].text}`;
    }

    const lastMessage = history.pop(); // The current message to send

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: DEFAULTS.maxTokens,
        temperature: DEFAULTS.temperature,
      }
    });

    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const text = result.response.text();
    return { provider: "gemini", model: modelStr, text: text || "" };
  }

  // 2. Fallback to OpenRouter or OpenAI
  const provider = process.env.OPENROUTER_API_KEY ? "openrouter" : "openai";
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = provider === "openai" 
    ? process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
    : process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const aiModel = process.env.AI_MODEL || (provider === "openrouter" ? "google/gemini-2.5-flash:free" : "gpt-4o-mini");

  const url = `${baseUrl.replace(/\\/+$/, "")}/chat/completions`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (provider === "openrouter") {
    if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
    if (process.env.OPENROUTER_APP_NAME) headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
  }

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: aiModel,
      messages,
      temperature: DEFAULTS.temperature,
      max_tokens: DEFAULTS.maxTokens,
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
    provider,
    model: aiModel,
    text: typeof text === "string" ? text : "",
  };
}

