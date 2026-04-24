/**
 * OPIX AI Router — Multi-provider fallback
 * Priority: Groq → Gemini → Ollama → Anthropic
 * Semua free (kecuali Anthropic sebagai last resort)
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

export interface AIRouterOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIRouterResult {
  text: string;
  provider: string;
  model: string;
}

// ─── Groq (free: 14400 req/hari, llama-3.1-8b-instant) ───────────────────────
async function callGroq(prompt: string, opts: AIRouterOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const messages: any[] = [];
  if (opts.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
  messages.push({ role: "user", content: prompt });

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages,
      max_tokens: opts.maxTokens || 600,
      temperature: opts.temperature ?? 0.7,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err.slice(0, 200)}`);
  }
  const data: any = await res.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

// ─── Gemini (free: 1M token/hari, gemini-1.5-flash) ──────────────────────────
async function callGemini(prompt: string, opts: AIRouterOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey });
  const fullPrompt = opts.systemPrompt ? `${opts.systemPrompt}\n\n${prompt}` : prompt;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    contents: fullPrompt,
    config: {
      maxOutputTokens: opts.maxTokens || 600,
      temperature: opts.temperature ?? 0.7,
    },
  });

  return response.text?.trim() || "";
}

// ─── Ollama (lokal, unlimited) ────────────────────────────────────────────────
async function callOllama(prompt: string, opts: AIRouterOptions): Promise<string> {
  const baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.1";

  const messages: any[] = [];
  if (opts.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
  messages.push({ role: "user", content: prompt });

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        num_predict: opts.maxTokens || 600,
        temperature: opts.temperature ?? 0.7,
      },
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data: any = await res.json();
  return data.message?.content?.trim() || "";
}

// ─── Anthropic (paid, last resort) ───────────────────────────────────────────
async function callAnthropic(prompt: string, opts: AIRouterOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });
  const msgs: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  const msg = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
    max_tokens: opts.maxTokens || 600,
    system: opts.systemPrompt,
    messages: msgs,
  });

  return msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
}

// ─── AUTOROUTER ───────────────────────────────────────────────────────────────
const PROVIDERS = [
  { name: "groq",      model: () => process.env.GROQ_MODEL || "llama-3.1-8b-instant", fn: callGroq },
  { name: "gemini",    model: () => process.env.GEMINI_MODEL || "gemini-1.5-flash",    fn: callGemini },
  { name: "ollama",    model: () => process.env.OLLAMA_MODEL || "llama3.1",            fn: callOllama },
  { name: "anthropic", model: () => process.env.ANTHROPIC_MODEL || "claude-haiku-4-5", fn: callAnthropic },
];

export async function aiGenerate(
  prompt: string,
  opts: AIRouterOptions = {}
): Promise<AIRouterResult> {
  const errors: string[] = [];

  // Allow forcing a provider via AI_PROVIDER env
  const forced = process.env.AI_PROVIDER;
  const providers = forced
    ? PROVIDERS.filter((p) => p.name === forced).concat(PROVIDERS.filter((p) => p.name !== forced))
    : PROVIDERS;

  for (const provider of providers) {
    try {
      const text = await provider.fn(prompt, opts);
      if (text) {
        const used = `${provider.name}/${provider.model()}`;
        if (errors.length > 0) {
          console.log(`[AI Router] Fallback used: ${used} (after: ${errors.join(", ")})`);
        }
        return { text, provider: provider.name, model: provider.model() };
      }
    } catch (err: any) {
      const msg = `${provider.name}: ${err.message?.slice(0, 100)}`;
      errors.push(msg);
      console.warn(`[AI Router] ${msg}`);
    }
  }

  throw new Error(`All AI providers failed:\n${errors.join("\n")}`);
}

// Export provider list for status endpoint
export function getProviderStatus() {
  return PROVIDERS.map((p) => ({
    name: p.name,
    model: p.model(),
    enabled: (() => {
      if (p.name === "groq") return !!process.env.GROQ_API_KEY;
      if (p.name === "gemini") return !!process.env.GEMINI_API_KEY;
      if (p.name === "ollama") return true; // always try
      if (p.name === "anthropic") return !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your-api-key-here");
      return false;
    })(),
  }));
}
