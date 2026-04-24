import { Router, Request, Response } from "express";
import { getDb } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { aiGenerate, getProviderStatus } from "../lib/aiRouter";

const router = Router();
router.use(requireAuth);

// GET /api/ai/status — cek provider mana yang aktif
router.get("/status", (_req: Request, res: Response) => {
  return res.json({ providers: getProviderStatus() });
});

// POST /api/ai/caption
router.post("/caption", async (req: Request, res: Response) => {
  const { topic, platform, tone, clientId } = req.body;
  if (!topic?.trim()) return res.status(400).json({ error: "Topik wajib diisi" });

  // Fetch brand guidelines if clientId provided
  let brandContext = "";
  if (clientId) {
    const db = getDb();
    const bg = db.prepare(
      "SELECT bg.*, c.name as client_name, c.industry FROM brand_guidelines bg JOIN clients c ON c.id = bg.client_id WHERE bg.client_id = ? AND c.org_id = ?"
    ).get(clientId, req.auth!.orgId) as any;
    if (bg) {
      brandContext = `\nBrand context:
- Client: ${bg.client_name} (${bg.industry || "general"})
- Brand voice: ${bg.brand_voice || "professional"}
- Tone: ${bg.tone || tone || "casual"}
- Key messages: ${bg.key_messages || "-"}
- Target audience: ${bg.target_audience || "-"}
- Regular hashtags: ${bg.hashtags || "-"}`;
    }
  }

  const platformGuide: Record<string, string> = {
    instagram: "Instagram: max 2200 chars, storytelling style, 5-10 hashtags, emoji friendly",
    tiktok: "TikTok: short punchy captions, hooks in first line, trending hashtags, max 300 chars",
    twitter: "Twitter/X: max 280 chars, concise, direct, 1-2 hashtags max",
    facebook: "Facebook: conversational, can be longer, encourage engagement",
    linkedin: "LinkedIn: professional tone, industry insights, no heavy hashtags",
    threads: "Threads: casual, conversational, similar to Twitter but longer allowed",
  };

  const platformInstr = platformGuide[platform?.toLowerCase()] || platformGuide.instagram;

  const systemPrompt = `You are an expert social media content creator for Indonesian brands and businesses. Write engaging captions in Bahasa Indonesia (or mixed if appropriate). Include relevant hashtags at the end. Return ONLY the caption text, no explanation.`;

  const prompt = `Write an engaging ${platform || "Instagram"} caption.
Topic: ${topic}
Tone: ${tone || "casual and friendly"}
Platform guide: ${platformInstr}${brandContext}`;

  try {
    const result = await aiGenerate(prompt, { maxTokens: 600, systemPrompt });
    return res.json({ caption: result.text, provider: result.provider, model: result.model });
  } catch (err: any) {
    return res.status(500).json({ error: "Semua AI provider gagal: " + err.message });
  }
});

// POST /api/ai/hashtags
router.post("/hashtags", async (req: Request, res: Response) => {
  const { topic, platform, clientId } = req.body;
  if (!topic?.trim()) return res.status(400).json({ error: "Topik wajib" });

  let industry = "general";
  if (clientId) {
    const db = getDb();
    const client = db.prepare("SELECT industry FROM clients WHERE id = ? AND org_id = ?").get(clientId, req.auth!.orgId) as any;
    if (client?.industry) industry = client.industry;
  }

  const prompt = `Generate 20 relevant hashtags for a ${platform || "Instagram"} post about: "${topic}" for a ${industry} brand in Indonesia.
Return ONLY hashtags, one per line, format: #hashtag. Mix Indonesian and English. Include popular, niche, and branded hashtags.`;

  try {
    const result = await aiGenerate(prompt, { maxTokens: 300 });
    const hashtags = result.text.split("\n").map((h: string) => h.trim()).filter((h: string) => h.startsWith("#"));
    return res.json({ hashtags, provider: result.provider, model: result.model });
  } catch (err: any) {
    return res.status(500).json({ error: "AI error: " + err.message });
  }
});

// POST /api/ai/brand-guidelines
router.post("/brand-guidelines", async (req: Request, res: Response) => {
  const { clientName, industry, description } = req.body;
  if (!clientName) return res.status(400).json({ error: "Nama client wajib" });

  const systemPrompt = `You are a brand strategist. Return ONLY valid JSON, no markdown, no explanation.`;

  const prompt = `Create comprehensive social media brand guidelines for:
- Brand: ${clientName}
- Industry: ${industry || "general"}
- Description: ${description || "N/A"}

Return this JSON object (write in Bahasa Indonesia, be specific):
{
  "brand_voice": "...",
  "tone": "...",
  "key_messages": "...",
  "visual_guidelines": "...",
  "hashtags": "#tag1 #tag2 #tag3",
  "target_audience": "..."
}`;

  try {
    const result = await aiGenerate(prompt, { maxTokens: 800, systemPrompt });
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: "AI response format error" });
    const guidelines = JSON.parse(jsonMatch[0]);
    return res.json({ guidelines, provider: result.provider, model: result.model });
  } catch (err: any) {
    return res.status(500).json({ error: "AI error: " + err.message });
  }
});

// POST /api/ai/improve — improve text (caption, title, excerpt, content)
router.post("/improve", async (req: Request, res: Response) => {
  const { text, type = "caption", platform, tone } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "Teks wajib" });

  const systemPrompt = `You are a professional copywriter for Indonesian social media and content. Improve the given text and return ONLY the improved version, no explanation.`;

  const prompt = `Improve this ${type} for ${platform || "social media"} with ${tone || "professional"} tone:

"${text}"

Return only the improved ${type}.`;

  try {
    const result = await aiGenerate(prompt, { maxTokens: 800, systemPrompt });
    return res.json({ improved: result.text, provider: result.provider, model: result.model });
  } catch (err: any) {
    return res.status(500).json({ error: "AI error: " + err.message });
  }
});

export default router;
