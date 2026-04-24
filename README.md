# SOCIYX — Social Media Management Platform

**Tiranyx SaaS Product** | v0.1.0 | Status: MVP Development

> Multi-client social media management platform with AI-powered content creation. Satu workspace untuk manage semua client, brand guidelines, scheduling, dan publish ke 6+ platform.

---

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS 4
- **Backend** (Phase 2): Node.js + Fastify + PostgreSQL + BullMQ
- **AI**: Google Generative AI (Gemini)

## Features (v1 MVP)

- Multi-client workspace (1 space per client, isolated)
- Brand guidelines & brand memory AI
- Caption generator dengan brand context
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

Semua dokumentasi di `docs/`:

| File | Isi |
|---|---|
| `01_PRD.md` | Product Requirements Document |
| `02_ERD.md` | Entity Relationship Diagram |
| `03_USER_STORIES.md` | User Stories per persona |
| `04_API_SPEC.md` | API Specification |
| `05_BACKEND_ARCH.md` | Backend Architecture |
| `06_ROADMAP.md` | Sprint Plan & Roadmap |

## Project Structure

```
sociyx/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Route pages
│   ├── services/       # API service layer
│   └── lib/            # Utilities
├── docs/               # Product documentation
├── index.html
└── package.json
```

---

**Part of Tiranyx Platform** · fahmiwol · 2026
