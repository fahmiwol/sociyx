import { Router, Request, Response } from "express";
import { getDb } from "../db/schema";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /api/clients
router.get("/", (req: Request, res: Response) => {
  const db = getDb();
  const clients = db.prepare(`
    SELECT c.*,
      bg.brand_voice, bg.tone, bg.hashtags,
      (SELECT COUNT(*) FROM posts p WHERE p.client_id = c.id) as post_count,
      (SELECT COUNT(*) FROM social_accounts sa WHERE sa.client_id = c.id AND sa.is_active = 1) as accounts_connected
    FROM clients c
    LEFT JOIN brand_guidelines bg ON bg.client_id = c.id
    WHERE c.org_id = ?
    ORDER BY c.is_active DESC, c.created_at DESC
  `).all(req.auth!.orgId);
  return res.json({ clients });
});

// GET /api/clients/:id
router.get("/:id", (req: Request, res: Response) => {
  const db = getDb();
  const client = db.prepare(`
    SELECT c.*, bg.brand_voice, bg.tone, bg.key_messages, bg.visual_guidelines, bg.hashtags, bg.target_audience
    FROM clients c
    LEFT JOIN brand_guidelines bg ON bg.client_id = c.id
    WHERE c.id = ? AND c.org_id = ?
  `).get(req.params.id, req.auth!.orgId) as any;
  if (!client) return res.status(404).json({ error: "Client tidak ditemukan" });

  const accounts = db.prepare(
    "SELECT id, platform, username, is_active FROM social_accounts WHERE client_id = ?"
  ).all(client.id);
  return res.json({ client: { ...client, social_accounts: accounts } });
});

// POST /api/clients
router.post("/", (req: Request, res: Response) => {
  const { name, industry, color, initials } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Nama client wajib" });
  const db = getDb();
  const result = db.prepare(
    "INSERT INTO clients (org_id, name, industry, color, initials) VALUES (?, ?, ?, ?, ?)"
  ).run(req.auth!.orgId, name.trim(), industry || null, color || "#6366f1", initials || name.trim().substring(0, 2).toUpperCase());
  return res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/clients/:id
router.put("/:id", (req: Request, res: Response) => {
  const db = getDb();
  const client = db.prepare("SELECT id FROM clients WHERE id = ? AND org_id = ?").get(req.params.id, req.auth!.orgId);
  if (!client) return res.status(404).json({ error: "Client tidak ditemukan" });

  const fields: string[] = [];
  const vals: unknown[] = [];
  for (const k of ["name", "industry", "color", "initials", "logo_url", "is_active"] as const) {
    if (req.body[k] !== undefined) { fields.push(`${k} = ?`); vals.push(req.body[k]); }
  }
  if (fields.length === 0) return res.status(400).json({ error: "No fields" });
  fields.push("updated_at = datetime('now')");
  vals.push(req.params.id);
  db.prepare(`UPDATE clients SET ${fields.join(", ")} WHERE id = ?`).run(...vals);

  // Update brand guidelines if provided
  const bg = req.body.brand_guidelines;
  if (bg) {
    const existing = db.prepare("SELECT id FROM brand_guidelines WHERE client_id = ?").get(req.params.id);
    if (existing) {
      db.prepare(`
        UPDATE brand_guidelines SET brand_voice=?, tone=?, key_messages=?, visual_guidelines=?, hashtags=?, target_audience=?, updated_at=datetime('now')
        WHERE client_id=?
      `).run(bg.brand_voice, bg.tone, bg.key_messages, bg.visual_guidelines, bg.hashtags, bg.target_audience, req.params.id);
    } else {
      db.prepare(`
        INSERT INTO brand_guidelines (client_id, brand_voice, tone, key_messages, visual_guidelines, hashtags, target_audience)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(req.params.id, bg.brand_voice, bg.tone, bg.key_messages, bg.visual_guidelines, bg.hashtags, bg.target_audience);
    }
  }
  return res.json({ ok: true });
});

// DELETE /api/clients/:id
router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM clients WHERE id = ? AND org_id = ?").run(req.params.id, req.auth!.orgId);
  if (result.changes === 0) return res.status(404).json({ error: "Client tidak ditemukan" });
  return res.json({ ok: true });
});

export default router;
