# OPIX — Multi-Client Social Media Management Platform

**Tiranyx SaaS Product** | v0.1.0 | Target: opix.tiranyx.co.id

> Platform manajemen konten sosial media berbasis AI untuk agensi, freelancer, dan tim marketing yang mengelola banyak client sekaligus. Satu workspace terisolasi per client — riset, pembuatan konten, scheduling, hingga publish ke 6+ platform.

---

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS 4
- **Backend** (Phase 2): Node.js + Fastify + PostgreSQL + BullMQ
- **AI**: Google Generative AI (Gemini) + Claude

## Features (v1 MVP)

- Multi-client workspace (1 space per client, isolated)
- Brand guidelines & brand memory AI
- Caption generator dengan brand context otomatis
- Media management & upload
- Post scheduling & direct publish ke IG, TikTok, FB, X, Threads, YouTube
- Analytics dashboard per client

## Quick Start

```bash
npm install
cp .env.example .env
# Set GEMINI_API_KEY in .env
npm run dev   # http://localhost:3000
```

## Docs

| File | Isi |
|---|---|
| `docs/01_PRD.md` | Product Requirements Document |
| `docs/02_ERD.md` | Entity Relationship Diagram |
| `docs/03_USER_STORIES.md` | User Stories per persona |
| `docs/04_API_SPEC.md` | API Specification |
| `docs/05_BACKEND_ARCH.md` | Backend Architecture |
| `docs/06_ROADMAP.md` | Sprint Plan & Roadmap |

## Project Structure

```
opix/
├── src/
│   ├── components/     # UI components (Sidebar, Header)
│   ├── pages/          # Dashboard, Clients, BrandAssets, StudioAI, VideoEditor
│   ├── services/       # Gemini AI service
│   └── lib/            # Utilities
├── docs/               # Product documentation
├── index.html
└── package.json
```

---

**Part of Tiranyx Platform** · GitHub: fahmiwol/sociyx · 2026
