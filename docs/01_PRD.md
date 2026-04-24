# SocioStudio — Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** Draft for Review  
**Date:** April 2026  
**Type:** SaaS / Internal App  
**Tagline:** Multi-Client Social Media Management Platform with AI-Powered Content Creation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Users & Personas](#4-target-users--personas)
5. [Feature Scope](#5-feature-scope)
6. [Module Specifications](#6-module-specifications)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Out of Scope (v1)](#8-out-of-scope-v1)
9. [Dependencies & Risks](#9-dependencies--risks)
10. [Open Questions](#10-open-questions)

---

## 1. Executive Summary

SocioStudio adalah platform manajemen konten sosial media berbasis AI untuk agensi, freelancer, dan tim marketing yang mengelola banyak client sekaligus. Platform ini mengintegrasikan seluruh workflow konten — riset, pembuatan gambar/video, penulisan caption, scheduling, hingga publish ke 6+ platform — dalam satu workspace terisolasi per client.

### Core Value Proposition

| Nilai | Penjelasan |
|---|---|
| **Multi-client workspace** | Setiap client punya space sendiri: brand guidelines, credentials, kalender, analytics |
| **AI-native** | Setiap langkah dibantu AI yang sudah mengerti brand context client secara otomatis |
| **Direct publish** | Publish ke Instagram, TikTok, Facebook, X, Threads, YouTube via official API |
| **Setup once** | Brand guidelines di-setup sekali, ter-load otomatis di setiap sesi kerja |

---

## 2. Problem Statement

### Situasi Saat Ini

Content agency dan social media manager yang mengelola banyak client menghadapi masalah fragmentasi tool yang parah:

- **Riset** di Google Trends / Semrush
- **Desain** di Canva / Figma
- **Caption** ditulis manual atau copy-paste ke ChatGPT (tanpa brand context)
- **Scheduling** di Buffer / Later / spreadsheet manual
- **Laporan** di spreadsheet terpisah per client

Akibatnya:

- Rata-rata 40–60% waktu kerja habis untuk *switching context* antar tool
- Inkonsistensi brand voice antar post karena tidak ada memory brand
- Susah scale — menambah 1 client berarti tambah beban operasional linear
- Brand guidelines client sering tidak terpakai karena aksesnya terpisah

### Problem Statement

> "Tidak ada satu platform yang memungkinkan tim social media untuk mengelola banyak client sekaligus — dengan brand context ter-load otomatis, dibantu AI, dan bisa publish langsung — tanpa perlu pindah-pindah tool."

---

## 3. Goals & Success Metrics

### Business Goals

| Goal | Metrik | Target 6 Bulan |
|---|---|---|
| Adoption | Jumlah organisasi aktif | 50 org |
| Revenue | MRR (Monthly Recurring Revenue) | Rp 50 juta |
| Retention | Churn rate bulanan | < 5% |
| Engagement | DAU/MAU ratio | > 40% |

### Product Goals

| Goal | Metrik | Target |
|---|---|---|
| Onboarding friction | Waktu setup client pertama | < 15 menit |
| AI Quality | User rating per caption generate | > 4/5 |
| Reliability | Publish success rate | > 98% |
| Performance | API response time (non-AI, P95) | < 200ms |

### Anti-Goals

- Bukan pengganti Canva untuk desain kompleks
- Bukan alat analitik mendalam (bukan Sprout Social / Brandwatch)
- Bukan CRM atau customer support tool

---

## 4. Target Users & Personas

### Persona 1 — Dinda, Agency Manager

- **Background:** Memimpin agensi 8 orang, mengelola 15 client aktif
- **Goal:** Deliver konten berkualitas konsisten ke semua client tanpa tim kewalahan
- **Pain:** Harus briefing ulang tools/AI setiap ganti client karena tidak ada memory brand
- **Scenario:** Buka SocioStudio → pilih client → brand guidelines sudah ter-load → generate caption langsung sesuai brand voice

### Persona 2 — Rizal, Freelance Content Creator

- **Background:** 1 orang kelola 6 client berbeda, dari UMKM sampai startup
- **Goal:** Efisien waktu, tidak kerja manual berulang
- **Pain:** Switching context makan waktu, sering salah tone antar client
- **Scenario:** Semua client terpisah dengan warna, handle, dan AI context masing-masing

### Persona 3 — Sarah, In-house Marketing Lead

- **Background:** Tim 4 orang di brand fashion, 3 platform aktif
- **Goal:** Konsistensi brand, approval workflow, laporan performa
- **Pain:** Tidak ada alur approval sebelum post live, analytics tersebar
- **Scenario:** Editor buat draft → Sarah approve → auto-publish sesuai jadwal

---

## 5. Feature Scope

### Module Priority Matrix

| Modul | Prioritas | Fase | Effort Est. |
|---|---|---|---|
| Client Management + Setup Wizard | P0 | Phase 1 | 3 minggu |
| Caption & Hashtag Generator (AI) | P0 | Phase 1 | 1 minggu |
| Media Upload & Library | P0 | Phase 1 | 1 minggu |
| Post CRUD + Draft | P0 | Phase 1 | 1 minggu |
| Publish ke Instagram | P0 | Phase 1 | 1 minggu |
| Content Research AI | P0 | Phase 1 | 1 minggu |
| OAuth semua 6 platform | P1 | Phase 2 | 2 minggu |
| Scheduled Posting (BullMQ) | P1 | Phase 2 | 1 minggu |
| Multi-platform Publish | P1 | Phase 2 | 1 minggu |
| Image Generator (Stability AI) | P1 | Phase 2 | 1 minggu |
| Image Editor (canvas) | P1 | Phase 2 | 2 minggu |
| Analytics Dashboard | P1 | Phase 2 | 2 minggu |
| Team Roles & Permissions | P1 | Phase 2 | 1 minggu |
| Image-to-Video (Runway ML) | P2 | Phase 3 | 2 minggu |
| Billing (Stripe + Midtrans) | P2 | Phase 3 | 2 minggu |
| Approval Workflow | P2 | Phase 3 | 2 minggu |
| White Label | P3 | Phase 4 | 3 minggu |

---

## 6. Module Specifications

### 6.1 Client Management

#### 6.1.1 Client Profile

**Data yang dikumpulkan:**

```
- Nama brand / client *
- Industri / niche *
- Website URL
- Tagline / slogan
- Deskripsi brand (free text)
- Tahun berdiri
- Lokasi utama
- Logo URL (referensi eksternal)
- Warna avatar (auto-assign, editable)
- Inisial (auto-generate dari nama, editable)
- Status: active / inactive / archived
```

#### 6.1.2 Brand Guidelines

```
- Brand tone / voice (select + free text)
- Brand colors:
  - Primary color (hex + color picker)
  - Secondary color (hex + color picker)
  - Accent colors (multiple, optional)
- Tipografi:
  - Font utama
  - Font pendukung (optional)
- Bahasa konten: id / en / bilingual
- Blacklist kata/frasa (array of strings)
- Brand assets:
  - Canva Brand Kit URL
  - Google Drive folder URL
  - Figma URL
  - PDF guidelines URL
```

#### 6.1.3 Social Media Accounts

```
Per platform:
- Platform (enum: instagram | tiktok | facebook | twitter | threads | youtube | linkedin | pinterest)
- Handle (@username)
- Profile URL
- OAuth access_token (encrypted)
- OAuth refresh_token (encrypted)
- Token expires_at
- Connection status: connected | expired | error | disconnected
- Profile stats snapshot (followers, bio — cached dari API)
```

#### 6.1.4 Objectives & KPIs

```
- Objective type (enum):
  brand_awareness | sales_conversion | community_building |
  thought_leadership | website_traffic | recruitment

- KPI targets (per bulan):
  - kpi_followers_new (integer)
  - kpi_reach (integer)
  - kpi_engagement_rate (decimal, %)
  - kpi_link_clicks (integer)
  - kpi_posts_per_month (integer)

- Target audience:
  - age_range (cth: "22-35")
  - gender: all | female_majority | male_majority
  - locations (array of strings)
  - interests (array of strings)
  - professions (array of strings)
```

#### 6.1.5 Content Strategy

```
- strategy_text (free text, deskripsi umum)
- content_pillars (array of strings, tag-based)
- posting_frequency (JSON per hari):
  { mon: 1, tue: 1, wed: 2, thu: 1, fri: 2, sat: 1, sun: 0 }
- best_time_to_post (JSON per platform):
  { instagram: ["07:00","12:00","19:00"], tiktok: ["20:00"] }
- competitors (array: handle atau URL)
- campaign_notes (free text, optional)
```

#### 6.1.6 Credentials

```
Per credential entry:
- key_type (enum):
  ig_access_token | tt_api_key | fb_page_token | tw_bearer_token |
  yt_channel_id | ga_measurement_id | meta_business_id |
  canva_brand_kit | gdrive_folder | other
- label (custom label)
- value (encrypted AES-256-GCM)
- created_at, updated_at
```

---

### 6.2 Content Studio

#### Behavior

Saat user memilih client di Content Studio, sistem:

1. Fetch `brand_guidelines` dari DB
2. Inject ke AI system prompt:

```
You are a social media content creator for [brand_name], a [industry] brand.
Brand tone: [tone].
Primary color: [primary_color]. Font: [font].
Language: [language].
Main objective: [objective].
Target audience: [audience_description].
NEVER use these words: [blacklist].
Always align content with brand values.
```

3. Semua subsequent AI calls dalam session tersebut menggunakan context ini

#### 6.2.1 Research & Ideation

- Input: topik / keyword / campaign brief
- Output AI (streaming):
  - Analisis tren & potensi (2–3 kalimat)
  - 5 ide konten dengan reasoning
  - 2 contoh hook/pembuka
  - 10–15 hashtag tematik
  - Angle diferensiasi dari kompetitor
- History disimpan per client (research_sessions table)

#### 6.2.2 Caption Generator

- Input: topik, tone override (optional), platform, bahasa, jumlah hashtag
- Output: caption body + hashtag list (terpisah, bisa copy individual)
- Mode: Streaming SSE (first token < 1 detik)
- Fitur tambahan:
  - Regenerate (variasi berbeda tanpa input ulang)
  - Edit manual setelah generate
  - Simpan sebagai template

#### 6.2.3 Image Generator

- Provider: Stability AI (SDXL) / DALL-E 3 / Replicate (configurable per org)
- Input: deskripsi teks, style, aspect ratio
- Styles: Fotografi Realis, Ilustrasi, Flat Design, 3D Render, Watercolor, Minimalis
- Aspect ratios: 1:1 (1024×1024), 9:16 (768×1344), 16:9 (1344×768), 4:5 (896×1120)
- Platform presets: otomatis pilih ratio optimal per platform

#### 6.2.4 Image Editor

- Engine: HTML5 Canvas + Fabric.js (browser-based, no server round-trip)
- Fitur:
  - Add text layer: font, size, color, weight, alignment, shadow
  - Drag & drop positioning
  - Filters: brightness, contrast, saturation, grayscale, sepia, vignette, blur
  - Overlay: gradient, solid color (adjustable opacity)
  - Sticker / emoji layer
  - Crop & resize (free, locked ratio, platform preset)
  - Flip horizontal/vertical
  - Undo/redo stack (20 langkah)
  - Export: PNG (lossless), JPEG (quality slider)

#### 6.2.5 Image-to-Video

- Provider: Runway ML Gen-3 / Luma Dream Machine (configurable)
- Input: 1 gambar sumber, deskripsi motion (optional)
- Motion presets: Zoom In, Zoom Out, Ken Burns, Pan Left-Right, Fade In, Parallax
- Durasi: 3 / 5 / 7 / 10 / 15 detik
- Format output: MP4 H.264, WebM
- Resolusi presets: 1080×1080 (IG Feed), 1080×1920 (Story/TikTok), 1920×1080 (YouTube)
- Background music: royalty-free library (10 pilihan) atau upload sendiri
- Processing: async job — user dapat notifikasi saat selesai

#### 6.2.6 Scheduler & Publisher

- Datetime picker dengan timezone: WIB (Asia/Jakarta), WITA (Asia/Makassar), WIT (Asia/Jayapura)
- Platform selector: checkbox multi-pilih (hanya tampilkan platform yang connected untuk client tersebut)
- Validasi sebelum publish:
  - Twitter/X: caption ≤ 280 karakter (counter live)
  - Threads: caption ≤ 500 karakter
  - LinkedIn: caption ≤ 3000 karakter
  - Format file sesuai requirement platform
- Status lifecycle: `draft` → `scheduled` → `publishing` → `published` / `failed`
- Retry otomatis: 3× dengan exponential backoff (1 menit, 5 menit, 15 menit)
- Kalender visual: tampilan bulan, event per platform dengan warna berbeda

---

## 7. Non-Functional Requirements

### Performance

| Metrik | Target |
|---|---|
| API response time (non-AI, P95) | < 200ms |
| AI first token latency | < 1 detik |
| Image generation (Stability AI) | < 15 detik |
| Video generation (async) | < 3 menit |
| Publish execution time per platform | < 10 detik |
| Calendar page load | < 500ms |

### Reliability

| Metrik | Target |
|---|---|
| Uptime SLA | 99.5% per bulan |
| Publish success rate | > 98% |
| Data backup frequency | Setiap 6 jam |
| Backup retention | 30 hari |
| RTO (Recovery Time Objective) | < 4 jam |

### Security

- Semua OAuth tokens & credentials client: enkripsi AES-256-GCM (Supabase Vault)
- Transport: TLS 1.3
- JWT expiry: 15 menit + refresh token 30 hari (rotasi setiap refresh)
- Row Level Security (RLS): query isolation antar organisasi di level database
- Rate limit: 300 req/menit per org, 30 AI generate/menit per org
- Input validation: JSON Schema validation di semua endpoint (Fastify)
- File upload: server-side MIME type validation, bukan hanya extension

### Scalability

- Horizontal autoscale (Railway / Fly.io)
- Database connection pooling (PgBouncer via Supabase)
- Media served via CDN (Cloudflare / Supabase CDN)
- Job queue: BullMQ dengan Redis Cluster untuk scheduling

---

## 8. Out of Scope (v1)

- ❌ Manajemen komentar & DM (social inbox)
- ❌ Influencer discovery & management
- ❌ Advanced social listening / mention tracking
- ❌ A/B testing konten otomatis
- ❌ Deep competitor analysis (bukan core)
- ❌ Native mobile app (Phase 3+, PWA dulu)
- ❌ Multi-language platform UI (hanya Bahasa Indonesia + English)
- ❌ Custom AI model fine-tuning per brand

---

## 9. Dependencies & Risks

### External Dependencies

| Dependency | Risiko | Mitigasi |
|---|---|---|
| Anthropic API | Downtime / rate limit | Fallback ke OpenAI GPT-4o |
| Instagram Graph API | Perubahan kebijakan Meta | Monitor changelog, abstraksi layer |
| TikTok Content API | API masih terbatas / berubah | Beta flag, fallback manual |
| Stability AI | Cost naik / downtime | Support Replicate sebagai alternatif |
| Runway ML | API belum stable | Feature flag, async queue |
| Supabase | Vendor dependency | Export-ready schema, bisa migrate ke self-hosted |

### Technical Risks

| Risiko | Level | Mitigasi |
|---|---|---|
| Token refresh gagal → client disconnect | Tinggi | Monitoring aktif + email alert + auto-retry |
| AI generate output inkonsisten | Sedang | Prompt versioning + feedback loop |
| Video generation timeout | Sedang | Async job + polling + notifikasi |
| Storage biaya tidak terkontrol | Sedang | Per-org storage quota + cleanup job |

---

## 10. Open Questions

| # | Pertanyaan | Owner | Deadline |
|---|---|---|---|
| 1 | Apakah video generation pakai Runway ML atau Luma Dream Machine? | Tech Lead | Sebelum Phase 2 |
| 2 | Apakah client brand (bukan hanya agensi) bisa login untuk approve post? | Product | Pre-beta |
| 3 | SaaS B2B saja (agensi) atau juga direct ke brand? | Business | Pre-launch |
| 4 | White label: per-client subdomain atau per-org? | Product | Phase 3 |
| 5 | Pinterest & LinkedIn: masuk Phase 1 atau defer? | Tech Lead | Phase 1 planning |
| 6 | Mobile: PWA cukup atau React Native? | Tech Lead | Post-Phase 2 |
| 7 | Payment gateway Indonesia: Midtrans saja atau + Xendit? | Business | Phase 3 |
