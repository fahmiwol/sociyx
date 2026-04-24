import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getDb } from "../db/schema";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// GET /api/media?client_id=
router.get("/", (req: Request, res: Response) => {
  const db = getDb();
  const { client_id } = req.query as any;
  let sql = "SELECT * FROM media_assets WHERE org_id = ?";
  const params: unknown[] = [req.auth!.orgId];
  if (client_id) { sql += " AND client_id = ?"; params.push(client_id); }
  sql += " ORDER BY created_at DESC";
  const assets = db.prepare(sql).all(...params);
  return res.json({ assets });
});

// POST /api/media/upload
router.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const db = getDb();
  const url = `/uploads/${req.file.filename}`;
  const result = db.prepare(`
    INSERT INTO media_assets (org_id, client_id, filename, original_name, mime_type, file_size, url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.auth!.orgId,
    req.body.client_id || null,
    req.file.filename,
    req.file.originalname,
    req.file.mimetype,
    req.file.size,
    url
  );
  return res.json({ id: result.lastInsertRowid, url, filename: req.file.filename, originalName: req.file.originalname });
});

// DELETE /api/media/:id
router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb();
  const asset = db.prepare("SELECT * FROM media_assets WHERE id = ? AND org_id = ?").get(req.params.id, req.auth!.orgId) as any;
  if (!asset) return res.status(404).json({ error: "Asset tidak ditemukan" });
  const filePath = path.join(UPLOAD_DIR, asset.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  db.prepare("DELETE FROM media_assets WHERE id = ?").run(req.params.id);
  return res.json({ ok: true });
});

export default router;
