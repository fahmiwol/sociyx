# SocioStudio — Roadmap, Sprint Plan & Technical Decisions

**Version:** 1.0.0  
**Planning Horizon:** 6 Bulan (Phase 1–3)  
**Team Estimasi:** 2–3 Backend Engineer, 1–2 Frontend Engineer, 1 Product

---

## Table of Contents

1. [Roadmap Overview](#1-roadmap-overview)
2. [Phase 1 — MVP (Bulan 1–2)](#2-phase-1--mvp-bulan-12)
3. [Phase 2 — Beta (Bulan 3–4)](#3-phase-2--beta-bulan-34)
4. [Phase 3 — Scale (Bulan 5–6)](#4-phase-3--scale-bulan-56)
5. [Sprint Breakdown Phase 1](#5-sprint-breakdown-phase-1)
6. [Definition of Done](#6-definition-of-done)
7. [Technical Decision Log (ADR)](#7-technical-decision-log-adr)
8. [Platform API Limits Reference](#8-platform-api-limits-reference)
9. [Pricing Model](#9-pricing-model)

---

## 1. Roadmap Overview

```
Bulan 1     Bulan 2     Bulan 3     Bulan 4     Bulan 5     Bulan 6
├───────────┤───────────┤───────────┤───────────┤───────────┤───────────►
│  Phase 1: MVP         │  Phase 2: Beta        │  Phase 3: Scale       │
│  Internal + Pilot     │  10 paying orgs       │  SaaS public launch   │
│                       │                       │                       │
│ ✓ Auth & Orgs         │ ✓ OAuth semua platform│ ✓ Image-to-Video      │
│ ✓ Client Wizard       │ ✓ Scheduler BullMQ    │ ✓ Billing (Stripe)    │
│ ✓ Brand Guidelines    │ ✓ Multi-platform pub  │ ✓ Approval workflow   │
│ ✓ Caption AI          │ ✓ Image Generator     │ ✓ Bulk scheduling     │
│ ✓ Media Upload        │ ✓ Image Editor        │ ✓ White label prep    │
│ ✓ Post CRUD           │ ✓ Analytics dashboard │ ✓ Mobile PWA          │
│ ✓ IG Publish          │ ✓ Team RBAC           │ ✓ Public API          │
│ ✓ Research AI         │ ✓ Notifications       │                       │
└───────────────────────┴───────────────────────┴───────────────────────┘
```

---

## 2. Phase 1 — MVP (Bulan 1–2)

**Goal:** Platform bisa digunakan internal + 3 client pilot nyata  
**Success Metric:** 3 client aktif, 50+ posts terpublish via platform  
**Team:** 2 Backend + 1 Frontend

### Feature Checklist Phase 1

- [ ] Auth system (register, login, JWT refresh, email verify, logout)
- [ ] Organization management (create, settings)
- [ ] Client Management CRUD
- [ ] Client Setup Wizard — semua 7 langkah (profil, brand, socials manual, objectives, strategy, credentials, review)
- [ ] Brand Guidelines — full CRUD termasuk color picker, blacklist tags
- [ ] Social Accounts — manual token input (bukan OAuth dulu — OAuth di Phase 2)
- [ ] Caption Generator — streaming SSE dengan brand context injection
- [ ] Hashtag Generator
- [ ] Content Research AI — streaming
- [ ] Media upload — image only (JPEG, PNG, WEBP, max 20MB)
- [ ] Media Library — per client, basic grid view
- [ ] Post CRUD — draft mode
- [ ] Post preview per platform
- [ ] Publish ke Instagram via Graph API
- [ ] Basic dashboard (stats mockup, upcoming posts list)
- [ ] Calendar view — bulan, events per tanggal
- [ ] Client overview page

### Deliverables Phase 1

- API server live di staging (Railway atau Fly.io)
- Database schema v1 dengan RLS aktif
- Frontend dasar (Next.js, semua halaman Phase 1)
- Manual QA checklist passed
- 3 client pilot onboarded dan aktif posting

---

## 3. Phase 2 — Beta (Bulan 3–4)

**Goal:** 10 paying organizations, team workflow, semua 6 platform connected  
**Success Metric:** 10 orgs aktif, > 200 posts/bulan via platform, 0 critical bugs  
**Team:** 2 Backend + 2 Frontend

### Feature Checklist Phase 2

- [ ] OAuth flow semua platform: Instagram, TikTok, Facebook, Twitter/X, Threads, YouTube
- [ ] Token auto-refresh background job (BullMQ)
- [ ] Token expired detection + email/in-app notification
- [ ] Scheduled posting (BullMQ scheduler, cron per menit)
- [ ] Multi-platform simultaneous publish
- [ ] Publish retry logic (3× exponential backoff)
- [ ] Post status lifecycle (draft → scheduled → publishing → published/failed)
- [ ] Image Generator — Stability AI SDXL integration
- [ ] Image Editor — canvas-based, teks overlay, filters, crop
- [ ] Analytics Dashboard — pull dari platform API, cache 24 jam
- [ ] Agency Overview Dashboard
- [ ] Team Management — invite, roles (owner/admin/editor/viewer), RBAC
- [ ] In-app notifications
- [ ] Email notifications (Resend)
- [ ] Caption Templates (simpan & load)
- [ ] Media Library — filter, sort, search, delete
- [ ] Billing halaman (plan comparison) — belum payment gateway

### Deliverables Phase 2

- Production environment live
- Semua 6 platform OAuth tested dan working
- Beta user onboarding guide
- Analytics data flowing dari platform APIs
- Team invite & RBAC working

---

## 4. Phase 3 — Scale (Bulan 5–6)

**Goal:** SaaS public launch, 50+ orgs, recurring revenue  
**Success Metric:** MRR Rp 25 juta, churn < 7%, NPS > 40

### Feature Checklist Phase 3

- [ ] Image-to-Video — Runway ML atau Luma Dream Machine integration
- [ ] Video async job + polling + notification
- [ ] Billing integration — Stripe (kartu) + Midtrans (IDR: transfer, e-wallet)
- [ ] Subscription management (upgrade, downgrade, cancel)
- [ ] Usage monitoring + limit enforcement per plan
- [ ] Approval Workflow — editor submit → admin/owner approve → auto-publish
- [ ] Bulk scheduling — import CSV, set jadwal per baris
- [ ] AI best time recommendation (based on analytics data)
- [ ] Performance insights AI ("Post hari Senin pukul 19:00 rata-rata 2× lebih tinggi reach-nya")
- [ ] White label preparation (custom domain, custom logo)
- [ ] Mobile PWA (responsive + installable)
- [ ] Public API untuk enterprise (rate-limited, API key auth)
- [ ] Audit log UI (history semua aksi di org)
- [ ] Data export (CSV / JSON per client)
- [ ] GDPR compliance (data export request, deletion request)

---

## 5. Sprint Breakdown Phase 1

### Sprint 1 (Minggu 1–2) — Foundation

**Backend:**
- [ ] Project setup: Fastify + TypeScript + Drizzle ORM + Supabase
- [ ] Database migrations: organizations, users, clients tables
- [ ] Auth endpoints: /auth/register, /auth/login, /auth/refresh, /auth/logout, /auth/me
- [ ] JWT middleware + RLS context injection
- [ ] Encryption utility (AES-256-GCM)
- [ ] Error handling & logging setup (Sentry)

**Frontend:**
- [ ] Next.js 14 project setup + Tailwind CSS
- [ ] Auth pages: Register, Login, Email Verify
- [ ] Protected routes HOC
- [ ] Layout dasar (shell + navigasi)

**Definition of Done Sprint 1:**
- User bisa register, verify email, login, dan logout
- JWT auth working dengan RLS
- Staging environment deployed

---

### Sprint 2 (Minggu 3–4) — Client Setup

**Backend:**
- [ ] Clients CRUD API
- [ ] Client brand guidelines API (upsert)
- [ ] Client objectives API (upsert)
- [ ] Client strategy API (upsert)
- [ ] Client credentials API (encrypted storage)
- [ ] Social accounts — manual token input (tanpa OAuth dulu)

**Frontend:**
- [ ] Halaman Semua Client (grid + new client card)
- [ ] Setup Wizard — 7 step: Profil, Brand, Sosmed, Objektif, Strategi, Credentials, Review
- [ ] Color picker component
- [ ] Tag input component (content pillars, blacklist, competitors)
- [ ] Client overview page

**Definition of Done Sprint 2:**
- Setup wizard end-to-end working (semua 7 step bisa diisi dan disimpan)
- Client data terisolasi per org (RLS tested)

---

### Sprint 3 (Minggu 5–6) — AI Content Generation

**Backend:**
- [ ] Brand context builder (buildBrandContext function)
- [ ] Caption generator SSE endpoint
- [ ] Hashtag generator endpoint
- [ ] Research SSE endpoint
- [ ] Usage logging
- [ ] Anthropic API integration + streaming

**Frontend:**
- [ ] Content Studio layout (2 kolom: main + sidebar)
- [ ] Client selector dengan brand brief chip
- [ ] Research panel dengan streaming output
- [ ] Caption panel dengan streaming, copy buttons, regenerate
- [ ] Hashtag display + copy

**Definition of Done Sprint 3:**
- Caption AI generate dengan brand context dari client yang dipilih
- Research AI working dengan streaming
- Usage logs tersimpan di DB

---

### Sprint 4 (Minggu 7–8) — Media, Posts, & Publish

**Backend:**
- [ ] Media upload endpoint (multipart, Supabase Storage)
- [ ] Media library API
- [ ] Post CRUD API (draft, update, delete)
- [ ] Calendar API
- [ ] Instagram publish via Graph API
- [ ] Basic dashboard stats

**Frontend:**
- [ ] Media upload (drag & drop)
- [ ] Media library grid
- [ ] Post form (caption, hashtags, media picker, post type)
- [ ] Post preview per platform
- [ ] Publish now button + hasil
- [ ] Calendar view (bulan, events)
- [ ] Dashboard (stats cards + upcoming posts list)

**Definition of Done Sprint 4:**
- Upload gambar → tambah ke post → publish ke Instagram working end-to-end
- Calendar menampilkan post yang dibuat

---

## 6. Definition of Done

Sebuah task dianggap Done jika:

- [ ] **Code review** disetujui minimal 1 engineer lain
- [ ] **Tests** unit test ditulis untuk logika bisnis critical (service layer), passing
- [ ] **Integration test** endpoint API tested dengan Supertest
- [ ] **No P0 bugs** — tidak ada bug yang block penggunaan fitur
- [ ] **Error handling** — semua edge case dan error di-handle dengan response yang konsisten
- [ ] **Logging** — action penting di-log di Sentry / console structured
- [ ] **Deployed ke staging** — fitur bisa diakses dan dites di staging environment
- [ ] **Acceptance criteria** — semua AC dari User Story terpenuhi
- [ ] **Dokumentasi** — endpoint baru ditambahkan ke API spec

---

## 7. Technical Decision Log (ADR)

### ADR-001: Fastify vs Express

**Status:** Accepted  
**Tanggal:** April 2026

**Konteks:** Perlu memilih HTTP framework untuk backend Node.js.

**Keputusan:** Fastify

**Alasan:**
- Benchmark menunjukkan Fastify ~3× lebih cepat dari Express di kondisi setara
- Built-in JSON schema validation mengurangi boilerplate
- TypeScript support lebih baik
- Plugin lifecycle yang explicit dan predictable

**Trade-off:** Ekosistem plugin lebih kecil dari Express, tapi semua plugin kritis sudah tersedia.

---

### ADR-002: Supabase vs Self-hosted PostgreSQL

**Status:** Accepted  
**Tanggal:** April 2026

**Konteks:** Perlu database dengan RLS, auth, storage, dan realtime.

**Keputusan:** Supabase (managed)

**Alasan:**
- Row Level Security built-in — kritikal untuk multi-tenant
- Supabase Vault untuk enkripsi credentials
- Integrated auth (bisa pakai sendiri atau extend dengan Fastify JWT)
- Storage S3-compatible dengan CDN otomatis
- Export-ready — bisa migrate ke self-hosted Supabase jika perlu

**Trade-off:** Vendor dependency, biaya bisa naik di scale besar.  
**Mitigasi:** Schema di Drizzle ORM — bisa migrate ke bare PostgreSQL kapan saja.

---

### ADR-003: BullMQ vs Agenda vs pg-boss

**Status:** Accepted  
**Tanggal:** April 2026

**Konteks:** Perlu job queue untuk scheduled posting dan background tasks.

**Keputusan:** BullMQ dengan Redis (Upstash)

**Alasan:**
- BullMQ matang dan battle-tested (successor Bull)
- Redis sebagai backend — cepat, reliable
- Built-in retry dengan exponential backoff
- Bull Board UI untuk monitoring jobs
- Concurrency control per queue

**Trade-off:** Tambah dependency Redis. Alternatif pg-boss (PostgreSQL-backed) lebih simple tapi kurang fitur.  
**Mitigasi:** Upstash Redis — serverless Redis, tidak perlu manage infra.

---

### ADR-004: Drizzle ORM vs Prisma vs Kysely

**Status:** Accepted  
**Tanggal:** April 2026

**Konteks:** Perlu ORM/query builder yang type-safe dengan PostgreSQL.

**Keputusan:** Drizzle ORM

**Alasan:**
- Performanya mendekati raw SQL (tidak ada N+1 magic yang hidden)
- Type inference langsung dari schema — tidak perlu generate types
- Migration system sederhana
- Lebih ringan dari Prisma (tidak ada Prisma Client, tidak ada engine binary)

**Trade-off:** Lebih verbose dari Prisma untuk relasi kompleks.  
**Mitigasi:** Helper functions untuk query patterns yang berulang.

---

### ADR-005: Anthropic Claude sebagai AI Primary

**Status:** Accepted  
**Tanggal:** April 2026

**Konteks:** Pilih LLM provider untuk caption & research generation.

**Keputusan:** Anthropic Claude Sonnet 4 sebagai primary, OpenAI GPT-4o sebagai fallback.

**Alasan:**
- Kualitas Bahasa Indonesia Claude lebih baik untuk copywriting
- Streaming SSE support native
- Context window 200K token — cukup untuk brand guidelines panjang
- Harga kompetitif untuk output token

**Trade-off:** Single provider dependency.  
**Mitigasi:** Abstraksi layer di `integrations/ai/` — bisa swap provider dengan config change.

---

### ADR-006: Enkripsi Credentials — AES-256-GCM vs Supabase Vault

**Status:** Accepted  
**Tanggal:** April 2026

**Konteks:** Credentials client (OAuth tokens, API keys) harus disimpan aman.

**Keputusan:** AES-256-GCM di application layer, dengan kunci di environment variable (tidak di DB).

**Alasan:**
- Supabase Vault tersedia tapi memerlukan upgrade plan
- AES-256-GCM memberikan enkripsi + authentication (tidak bisa tampering)
- Kunci enkripsi tidak pernah masuk ke database — ada di environment/secrets manager
- IV dan auth tag di-prefix ke ciphertext — stateless, tidak perlu tabel tambahan

**Trade-off:** Key rotation manual (harus decrypt-re-encrypt semua).  
**Mitigasi:** Key versioning di prefix ciphertext untuk memudahkan rotation.

---

## 8. Platform API Limits Reference

| Platform | Publish Limit | Media Max Size | Video Format | Token Type | Catatan |
|---|---|---|---|---|---|
| Instagram | 50 API calls/jam per token | Image 8MB, Video 100MB | MP4 (H.264) | User Token (60 hari) | Butuh 2-step: container + publish |
| TikTok | 20 post/hari per akun | Video 4GB | MP4, WebM | Access Token (24 jam) | Share-to-TikTok flow untuk video |
| Facebook | 200 req/jam per token | Video 4GB | MP4, MOV | Page Access Token (60 hari) | Butuh Page ID |
| Twitter/X | 300 tweet/3 jam | Image 5MB, Video 512MB | MP4 | OAuth 2.0 Bearer | Media upload terpisah |
| Threads | 250 post/hari | Video 1GB | MP4 | User Token (via Meta) | API masih beta |
| YouTube | 10.000 unit/hari | Video 256GB | MP4, MOV, AVI | OAuth 2.0 | Resumable upload untuk > 5MB |
| LinkedIn | 100 req/hari per app | Image 10MB, Video 200MB | MP4 | OAuth 2.0 | Perlu Company Page untuk brand |

**Platform-specific error codes yang harus di-handle:**

```
Instagram:
  - (#10) Application does not have permission
  - (#200) Permissions error
  - MEDIA_TYPE_UNSUPPORTED

TikTok:
  - error_code: 2200 (invalid access token)
  - error_code: 2202 (insufficient scope)

Facebook:
  - Error 190: Access token expired
  - Error 200: Permissions error

Twitter/X:
  - 401: Unauthorized
  - 429: Too Many Requests
  - 187: Status is a duplicate
```

---

## 9. Pricing Model

### Plan Comparison

| Fitur | Starter | Pro | Agency | Enterprise |
|---|---|---|---|---|
| **Harga/bulan (IDR)** | Rp 299.000 | Rp 799.000 | Rp 1.990.000 | Custom |
| **Harga/tahun (diskon 20%)** | Rp 2.868.000 | Rp 7.670.400 | Rp 19.104.000 | Custom |
| **Max Client** | 3 | 10 | Unlimited | Unlimited |
| **Anggota Tim** | 1 (owner) | 3 | 10 | Unlimited |
| **Post/bulan** | 60 | 300 | Unlimited | Unlimited |
| **AI Caption Generate** | 60 | 300 | Unlimited | Unlimited |
| **AI Image Generate** | 30 | 150 | Unlimited | Unlimited |
| **Image-to-Video** | 5 | 30 | Unlimited | Unlimited |
| **Storage Media** | 5 GB | 25 GB | 100 GB | Custom |
| **Platform Publish** | 3 | 6 | 6 | 6 + custom |
| **Analytics** | Basic (7 hari) | Full (90 hari) | Full + Export | Full + API |
| **Template Caption** | 5 | 50 | Unlimited | Unlimited |
| **Approval Workflow** | Tidak | Tidak | Ya | Ya |
| **Custom Domain** | Tidak | Tidak | Ya | Ya |
| **White Label** | Tidak | Tidak | Tidak | Ya |
| **Bulk Scheduling** | Tidak | Tidak | Ya | Ya |
| **Public API Access** | Tidak | Tidak | Tidak | Ya |
| **SLA** | Best effort | Email 2 hari | Priority 8 jam | Dedicated CSM |
| **Support** | Community | Email | Priority chat | Dedicated |

### Cost Estimation per Plan (untuk profitabilitas)

Asumsi per org per bulan:

| Cost Item | Starter | Pro | Agency |
|---|---|---|---|
| Anthropic API (caption + research) | ~Rp 8.000 | ~Rp 40.000 | ~Rp 150.000 |
| Stability AI (image gen) | ~Rp 15.000 | ~Rp 75.000 | ~Rp 250.000 |
| Storage (Supabase) | ~Rp 2.000 | ~Rp 8.000 | ~Rp 30.000 |
| Infra (Railway/Fly per org) | ~Rp 5.000 | ~Rp 5.000 | ~Rp 5.000 |
| **Total COGS** | ~Rp 30.000 | ~Rp 128.000 | ~Rp 435.000 |
| **Revenue** | Rp 299.000 | Rp 799.000 | Rp 1.990.000 |
| **Gross Margin** | ~90% | ~84% | ~78% |
