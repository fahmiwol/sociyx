import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { config } from "dotenv";

config();

import authRouter from "./routes/auth";
import clientsRouter from "./routes/clients";
import postsRouter from "./routes/posts";
import aiRouter from "./routes/ai";
import mediaRouter from "./routes/media";
import { getDb } from "./db/schema";

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Init DB on startup
getDb();

// Routes
app.use("/api/auth", authRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/media", mediaRouter);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// In production: serve frontend build
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
}

app.listen(PORT, () => {
  console.log(`✅ OPIX server running on http://localhost:${PORT}`);
});

export default app;
