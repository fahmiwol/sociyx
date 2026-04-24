import { Router, Request, Response } from "express";
import { getDb } from "../db/schema";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// ── Static routes FIRST (before /:id) ────────────────────────────────────────

// GET /api/posts/stats/dashboard
router.get("/stats/dashboard", (req: Request, res: Response) => {
  const db = getDb();
  const orgId = req.auth!.orgId;
  const totalClients = (db.prepare("SELECT COUNT(*) as n FROM clients WHERE org_id = ? AND is_active = 1").get(orgId) as any).n;
  const totalPosts   = (db.prepare("SELECT COUNT(*) as n FROM posts WHERE org_id = ?").get(orgId) as any).n;
  const scheduled    = (db.prepare("SELECT COUNT(*) as n FROM posts WHERE org_id = ? AND status = 'scheduled'").get(orgId) as any).n;
  const drafts       = (db.prepare("SELECT COUNT(*) as n FROM posts WHERE org_id = ? AND status = 'draft'").get(orgId) as any).n;
  const published    = (db.prepare("SELECT COUNT(*) as n FROM posts WHERE org_id = ? AND status = 'published'").get(orgId) as any).n;
  const recentPosts  = db.prepare(`
    SELECT p.id, p.title, p.caption, p.status, p.scheduled_at, p.platforms, p.created_at,
           c.name as client_name, c.color as client_color
    FROM posts p JOIN clients c ON c.id = p.client_id
    WHERE p.org_id = ? ORDER BY p.updated_at DESC LIMIT 5
  `).all(orgId);
  return res.json({ totalClients, totalPosts, scheduled, drafts, published, recentPosts });
});

// GET /api/posts/scheduler/log
router.get("/scheduler/log", (req: Request, res: Response) => {
  const db = getDb();
  try {
    const logs = db.prepare(`
      SELECT sl.id, sl.post_id, sl.action, sl.detail, sl.created_at,
             p.title, p.caption, c.name as client_name, c.color as client_color
      FROM scheduler_log sl
      LEFT JOIN posts p ON p.id = sl.post_id
      LEFT JOIN clients c ON c.id = sl.client_id
      WHERE sl.org_id = ?
      ORDER BY sl.created_at DESC LIMIT 50
    `).all(req.auth!.orgId);
    return res.json({ logs });
  } catch {
    return res.json({ logs: [] });
  }
});

// GET /api/posts/stats/calendar?year=2026&month=4
router.get("/stats/calendar", (req: Request, res: Response) => {
  const db = getDb();
  const { year, month } = req.query as any;
  const y = parseInt(year) || new Date().getFullYear();
  const m = parseInt(month) || (new Date().getMonth() + 1);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : y;
  const end = `${nextY}-${String(nextM).padStart(2, "0")}-01`;

  const posts = db.prepare(`
    SELECT p.id, p.title, p.caption, p.status, p.scheduled_at, p.platforms,
           c.name as client_name, c.color as client_color
    FROM posts p JOIN clients c ON c.id = p.client_id
    WHERE p.org_id = ?
      AND p.scheduled_at IS NOT NULL
      AND p.scheduled_at >= ? AND p.scheduled_at < ?
    ORDER BY p.scheduled_at ASC
  `).all(req.auth!.orgId, start, end);
  return res.json({ posts });
});

// GET /api/posts/stats/timeline?days=30
router.get("/stats/timeline", (req: Request, res: Response) => {
  const db = getDb();
  const days = Math.min(parseInt((req.query as any).days as string) || 30, 90);
  const rows = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM posts
    WHERE org_id = ? AND created_at >= DATE('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all(req.auth!.orgId);
  return res.json({ timeline: rows });
});

// GET /api/posts/stats/platforms
router.get("/stats/platforms", (req: Request, res: Response) => {
  const db = getDb();
  const allPosts = db.prepare("SELECT platforms FROM posts WHERE org_id = ?").all(req.auth!.orgId) as any[];
  const count: Record<string, number> = {};
  for (const p of allPosts) {
    try {
      const arr: string[] = JSON.parse(p.platforms || "[]");
      for (const pl of arr) if (pl) count[pl] = (count[pl] || 0) + 1;
    } catch {}
  }
  const platforms = Object.entries(count)
    .sort(([, a], [, b]) => b - a)
    .map(([name, total]) => ({ name, count: total }));
  return res.json({ platforms });
});

// GET /api/posts/stats/clients
router.get("/stats/clients", (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.name, c.color, COUNT(p.id) as count
    FROM clients c
    LEFT JOIN posts p ON p.client_id = c.id
    WHERE c.org_id = ? AND c.is_active = 1
    GROUP BY c.id ORDER BY count DESC LIMIT 10
  `).all(req.auth!.orgId);
  return res.json({ clients: rows });
});

// GET /api/posts?client_id=&status=&limit=&offset=
router.get("/", (req: Request, res: Response) => {
  const db = getDb();
  const { client_id, status, limit = "20", offset = "0" } = req.query as any;

  let sql = `SELECT p.*, c.name as client_name, c.color as client_color
    FROM posts p JOIN clients c ON c.id = p.client_id WHERE p.org_id = ?`;
  const params: unknown[] = [req.auth!.orgId];
  if (client_id) { sql += " AND p.client_id = ?"; params.push(client_id); }
  if (status)    { sql += " AND p.status = ?";    params.push(status); }
  sql += " ORDER BY p.updated_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  const posts = db.prepare(sql).all(...params);
  const countParams = params.slice(0, params.length - 2);
  const total = (db.prepare(
    `SELECT COUNT(*) as n FROM posts WHERE org_id = ?${client_id ? " AND client_id = ?" : ""}${status ? " AND status = ?" : ""}`
  ).get(...countParams) as any).n;
  return res.json({ posts, total });
});

// ── Parameterized routes AFTER statics ───────────────────────────────────────

// GET /api/posts/:id
router.get("/:id", (req: Request, res: Response) => {
  const db = getDb();
  const post = db.prepare(
    "SELECT p.*, c.name as client_name FROM posts p JOIN clients c ON c.id = p.client_id WHERE p.id = ? AND p.org_id = ?"
  ).get(req.params.id, req.auth!.orgId);
  if (!post) return res.status(404).json({ error: "Post tidak ditemukan" });
  return res.json({ post });
});

// POST /api/posts
router.post("/", (req: Request, res: Response) => {
  const { client_id, title, caption, hashtags, platforms, status, scheduled_at, cover_url, ai_generated } = req.body;
  if (!client_id) return res.status(400).json({ error: "client_id wajib" });
  const db = getDb();
  const client = db.prepare("SELECT id FROM clients WHERE id = ? AND org_id = ?").get(client_id, req.auth!.orgId);
  if (!client) return res.status(404).json({ error: "Client tidak ditemukan" });

  const result = db.prepare(`
    INSERT INTO posts (org_id, client_id, created_by, title, caption, hashtags, platforms, status, scheduled_at, cover_url, ai_generated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.auth!.orgId, client_id, req.auth!.userId,
    title || null, caption || "", hashtags || null,
    JSON.stringify(platforms || []),
    status || "draft", scheduled_at || null, cover_url || null,
    ai_generated ? 1 : 0
  );
  return res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/posts/:id
router.put("/:id", (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM posts WHERE id = ? AND org_id = ?").get(req.params.id, req.auth!.orgId);
  if (!existing) return res.status(404).json({ error: "Post tidak ditemukan" });

  const fields: string[] = [];
  const vals: unknown[] = [];
  for (const k of ["title", "caption", "hashtags", "platforms", "status", "scheduled_at", "cover_url"] as const) {
    if (req.body[k] !== undefined) {
      fields.push(`${k} = ?`);
      vals.push(k === "platforms" ? JSON.stringify(req.body[k]) : req.body[k]);
    }
  }
  if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });
  if (req.body.status === "published") fields.push("published_at = datetime('now')");
  fields.push("updated_at = datetime('now')");
  vals.push(req.params.id);
  db.prepare(`UPDATE posts SET ${fields.join(", ")} WHERE id = ?`).run(...vals);
  return res.json({ ok: true });
});

// DELETE /api/posts/:id
router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM posts WHERE id = ? AND org_id = ?").run(req.params.id, req.auth!.orgId);
  if (result.changes === 0) return res.status(404).json({ error: "Post tidak ditemukan" });
  return res.json({ ok: true });
});

export default router;
