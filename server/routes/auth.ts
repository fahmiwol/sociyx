import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db/schema";
import { signToken, requireAuth } from "../middleware/auth";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, fullName, orgName } = req.body;
  if (!email || !password || !fullName || !orgName)
    return res.status(400).json({ error: "Semua field wajib diisi" });

  const db = getDb();
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email))
    return res.status(409).json({ error: "Email sudah terdaftar" });

  const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const existingOrg = db.prepare("SELECT id FROM organizations WHERE slug = ?").get(slug);
  const finalSlug = existingOrg ? `${slug}-${Date.now()}` : slug;

  const orgResult = db.prepare(
    "INSERT INTO organizations (name, slug) VALUES (?, ?)"
  ).run(orgName.trim(), finalSlug);

  const orgId = orgResult.lastInsertRowid as number;
  const hash = await bcrypt.hash(password, 10);

  const userResult = db.prepare(
    "INSERT INTO users (org_id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)"
  ).run(orgId, email.toLowerCase().trim(), hash, fullName.trim(), "admin");

  const token = signToken({ userId: userResult.lastInsertRowid as number, orgId, role: "admin", email });
  res.cookie("opix_token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  return res.json({ ok: true, orgId, userId: userResult.lastInsertRowid });
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email dan password wajib" });

  const db = getDb();
  const user = db.prepare(
    "SELECT u.*, o.name as org_name, o.slug as org_slug FROM users u JOIN organizations o ON o.id = u.org_id WHERE u.email = ?"
  ).get(email.toLowerCase().trim()) as any;

  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: "Email atau password salah" });

  const token = signToken({ userId: user.id, orgId: user.org_id, role: user.role, email: user.email });
  res.cookie("opix_token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  return res.json({
    ok: true,
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, orgName: user.org_name }
  });
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("opix_token");
  return res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const user = db.prepare(
    "SELECT u.id, u.email, u.full_name, u.role, u.avatar_url, o.id as org_id, o.name as org_name, o.slug as org_slug, o.plan FROM users u JOIN organizations o ON o.id = u.org_id WHERE u.id = ?"
  ).get(req.auth!.userId) as any;
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
});

export default router;
