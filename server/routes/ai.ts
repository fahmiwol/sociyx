import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "../db/schema";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
      brandContext = `
Brand context:
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

  const prompt = `You are an expert social media content creator for Indonesian brands and businesses.
${brandContext}

Task: Write an engaging social media caption for ${platform || "Instagram"}.
Topic: ${topic}
Tone: ${tone || "casual and friendly"}
Platform guide: ${platformInstr}

Write the caption in Bahasa Indonesia (or mix with English if appropriate for the brand).
Include relevant hashtags at the end.
Return ONLY the caption text, no explanation.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const caption = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    return res.json({ caption });
  } catch (err: any) {
    return res.status(500).json({ error: "AI error: " + err.message });
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
Return ONLY hashtags, one per line, in format #hashtag. Mix Indonesian and English hashtags. Include popular, niche, and branded hashtags.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const hashtags = text.split("\n").map((h: string) => h.trim()).filter((h: string) => h.startsWith("#"));
    return res.json({ hashtags });
  } catch (err: any) {
    return res.status(500).json({ error: "AI error: " + err.message });
  }
});

// POST /api/ai/brand-guidelines
router.post("/brand-guidelines", async (req: Request, res: Response) => {
  const { clientName, industry, description } = req.body;
  if (!clientName) return res.status(400).json({ error: "Nama client wajib" });

  const prompt = `You are a brand strategist. Create comprehensive brand guidelines for a social media strategy for:
- Brand: ${clientName}
- Industry: ${industry || "general"}
- Description: ${description || "N/A"}

Return a JSON object with these exact keys:
{
  "brand_voice": "...",
  "tone": "...",
  "key_messages": "...",
  "visual_guidelines": "...",
  "hashtags": "#tag1 #tag2 #tag3 ...",
  "target_audience": "..."
}

Write in Bahasa Indonesia. Be specific and actionable.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: "AI response format error" });
    const guidelines = JSON.parse(jsonMatch[0]);
    return res.json({ guidelines });
  } catch (err: any) {
    return res.status(500).json({ error: "AI error: " + err.message });
  }
});

export default router;
