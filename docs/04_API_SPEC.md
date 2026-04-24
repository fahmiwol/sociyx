# SocioStudio — API Specification

**Version:** v1  
**Base URL:** `https://api.sociostudio.id/v1`  
**Auth:** `Authorization: Bearer <JWT>` pada semua endpoint kecuali `/auth/*`  
**Content-Type:** `application/json`  
**Rate Limit:** 300 req/menit per org (header: `X-RateLimit-Remaining`)

---

## Table of Contents

1. [Auth](#1-auth)
2. [Organization](#2-organization)
3. [Clients](#3-clients)
4. [Brand Guidelines](#4-brand-guidelines)
5. [Objectives & Strategy](#5-objectives--strategy)
6. [Social Accounts & OAuth](#6-social-accounts--oauth)
7. [Client Credentials](#7-client-credentials)
8. [Posts](#8-posts)
9. [AI Generation](#9-ai-generation)
10. [Media Assets](#10-media-assets)
11. [Analytics](#11-analytics)
12. [Team Management](#12-team-management)
13. [Notifications](#13-notifications)
14. [Billing](#14-billing)
15. [Error Reference](#15-error-reference)

---

## 1. Auth

### POST `/auth/register`

Register organisasi baru + owner account.

**Request:**
```json
{
  "full_name": "Dinda Pratiwi",
  "email": "dinda@sociostudio.id",
  "password": "SecurePass123!",
  "org_name": "Kreatif Agensi",
  "org_slug": "kreatif-agensi"  // optional, auto-generate jika kosong
}
```

**Response 201:**
```json
{
  "user": {
    "id": "usr_01HXYZ",
    "email": "dinda@sociostudio.id",
    "full_name": "Dinda Pratiwi",
    "role": "owner"
  },
  "org": {
    "id": "org_01HABC",
    "name": "Kreatif Agensi",
    "slug": "kreatif-agensi",
    "plan": "starter"
  },
  "message": "Verifikasi email sudah dikirim"
}
```

---

### POST `/auth/login`

**Request:**
```json
{
  "email": "dinda@sociostudio.id",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "rt_01HXYZ...",
  "expires_in": 900,
  "user": {
    "id": "usr_01HXYZ",
    "email": "dinda@sociostudio.id",
    "full_name": "Dinda Pratiwi",
    "role": "owner",
    "org_id": "org_01HABC",
    "avatar_url": null
  }
}
```

---

### POST `/auth/refresh`

**Request:**
```json
{ "refresh_token": "rt_01HXYZ..." }
```

**Response 200:**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "rt_01HNEW...",  // rotated
  "expires_in": 900
}
```

---

### POST `/auth/logout`

**Request:** _(no body)_  
**Response 204:** No Content

---

### GET `/auth/me`

**Response 200:**
```json
{
  "id": "usr_01HXYZ",
  "email": "dinda@sociostudio.id",
  "full_name": "Dinda Pratiwi",
  "role": "owner",
  "avatar_url": null,
  "org": {
    "id": "org_01HABC",
    "name": "Kreatif Agensi",
    "slug": "kreatif-agensi",
    "plan": "agency",
    "settings": {
      "timezone": "Asia/Jakarta",
      "default_language": "id"
    }
  }
}
```

---

## 2. Organization

### GET `/org/settings`

**Response 200:**
```json
{
  "id": "org_01HABC",
  "name": "Kreatif Agensi",
  "slug": "kreatif-agensi",
  "logo_url": "https://cdn.sociostudio.id/logos/org_01HABC.webp",
  "plan": "agency",
  "plan_expires_at": "2027-04-14T00:00:00Z",
  "settings": {
    "timezone": "Asia/Jakarta",
    "default_language": "id",
    "notification_email": true,
    "notification_inapp": true,
    "ai_provider_image": "stability",
    "ai_provider_video": "runway"
  },
  "usage": {
    "clients_count": 8,
    "posts_this_month": 67,
    "ai_images_this_month": 48,
    "ai_videos_this_month": 12,
    "storage_used_gb": 3.2
  }
}
```

---

### PATCH `/org/settings`

**Request:**
```json
{
  "name": "Kreatif Agensi ID",
  "settings": {
    "timezone": "Asia/Jakarta",
    "ai_provider_image": "dalle3"
  }
}
```

**Response 200:** Updated org object

---

### POST `/org/api-keys`

Simpan API key pihak ketiga untuk org (Anthropic, Stability, dll).

**Request:**
```json
{
  "provider": "anthropic",
  "key_value": "sk-ant-api03-...",
  "label": "Main Anthropic Key"
}
```

**Response 201:**
```json
{
  "id": "key_01HXYZ",
  "provider": "anthropic",
  "label": "Main Anthropic Key",
  "key_preview": "sk-ant-api03-...XXXX",  // hanya 4 karakter terakhir
  "created_at": "2026-04-14T09:00:00Z"
}
```

---

## 3. Clients

### GET `/clients`

**Query params:**
- `status` — `active` | `inactive` | `archived` (default: `active`)
- `search` — string pencarian
- `industry` — filter industri
- `page` — nomor halaman (default: 1)
- `per_page` — jumlah per halaman (default: 20, max: 100)
- `sort` — `name` | `created_at` | `updated_at` (default: `created_at`)
- `order` — `asc` | `desc` (default: `desc`)

**Response 200:**
```json
{
  "data": [
    {
      "id": "clnt_01HXYZ",
      "name": "Nusantara Roast",
      "industry": "F&B / Kopi",
      "website": "https://nusantaraRoast.com",
      "tagline": "Kopi Nusantara, Rasa Dunia",
      "color": "#BA7517",
      "initials": "NR",
      "status": "active",
      "platforms_connected": ["instagram", "tiktok", "facebook"],
      "setup_progress": {
        "profile": true,
        "brand": true,
        "socials": true,
        "objectives": true,
        "strategy": true,
        "credentials": false
      },
      "last_post_at": "2026-04-13T09:00:00Z",
      "created_at": "2026-01-15T08:00:00Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "per_page": 20,
    "total_pages": 1
  }
}
```

---

### POST `/clients`

**Request:**
```json
{
  "name": "Nusantara Roast",
  "industry": "F&B / Kopi",
  "website": "https://nusantaraRoast.com",
  "tagline": "Kopi Nusantara, Rasa Dunia",
  "description": "Brand kopi premium lokal...",
  "year_founded": 2019,
  "location": "Jakarta, Indonesia"
}
```

**Response 201:**
```json
{
  "id": "clnt_01HXYZ",
  "org_id": "org_01HABC",
  "name": "Nusantara Roast",
  "industry": "F&B / Kopi",
  "color": "#BA7517",
  "initials": "NR",
  "status": "active",
  "setup_progress": {
    "profile": true,
    "brand": false,
    "socials": false,
    "objectives": false,
    "strategy": false,
    "credentials": false
  },
  "created_at": "2026-04-14T08:00:00Z"
}
```

---

### GET `/clients/:id`

**Response 200:** Full client object (semua field + relasi satu level)

---

### PATCH `/clients/:id`

**Request:** Partial update — hanya field yang diubah  
**Response 200:** Updated client object

---

### DELETE `/clients/:id`

Soft delete (status → `archived`).  
**Response 200:**
```json
{ "id": "clnt_01HXYZ", "status": "archived", "archived_at": "2026-04-14T10:00:00Z" }
```

---

### GET `/clients/:id/overview`

Dashboard ringkasan client.

**Response 200:**
```json
{
  "client": { "id": "...", "name": "Nusantara Roast", "color": "#BA7517" },
  "stats": {
    "posts_this_month": 18,
    "reach_this_month": 42000,
    "engagement_rate": 5.2,
    "followers_gained": 340
  },
  "platforms": [
    { "platform": "instagram", "status": "connected", "followers": 12400, "handle": "@nusantaraRoast" },
    { "platform": "tiktok", "status": "connected", "followers": 8200, "handle": "@nusantaraRoast" }
  ],
  "upcoming_posts": [
    { "id": "post_01", "caption_preview": "Pagi yang sempurna...", "scheduled_at": "2026-04-15T07:00:00Z", "platforms": ["instagram"] }
  ],
  "setup_progress": { "profile": true, "brand": true, "socials": true, "objectives": true, "strategy": false, "credentials": false }
}
```

---

## 4. Brand Guidelines

### GET `/clients/:id/brand-guidelines`

**Response 200:**
```json
{
  "client_id": "clnt_01HXYZ",
  "tone": "hangat, storytelling, premium lokal",
  "tone_preset": "warm_storytelling",
  "primary_color": "#6B3A1F",
  "secondary_color": "#D4A04C",
  "accent_colors": ["#F5E6D0"],
  "font_primary": "Playfair Display",
  "font_secondary": "DM Sans",
  "language": "id",
  "blacklist_words": ["murah", "murahan", "biasa aja"],
  "asset_canva_url": "https://canva.com/brand/...",
  "asset_gdrive_url": "https://drive.google.com/...",
  "extra_notes": "Selalu sebutkan asal daerah biji kopi",
  "updated_at": "2026-04-10T14:00:00Z"
}
```

---

### PUT `/clients/:id/brand-guidelines`

Upsert (create or replace).

**Request:**
```json
{
  "tone": "hangat, storytelling, premium lokal",
  "tone_preset": "warm_storytelling",
  "primary_color": "#6B3A1F",
  "secondary_color": "#D4A04C",
  "font_primary": "Playfair Display",
  "language": "id",
  "blacklist_words": ["murah", "murahan"],
  "asset_gdrive_url": "https://drive.google.com/..."
}
```

**Response 200:** Updated brand guidelines object

---

## 5. Objectives & Strategy

### PUT `/clients/:id/objectives`

**Request:**
```json
{
  "objective_type": "brand_awareness",
  "kpi_followers_new": 500,
  "kpi_reach": 50000,
  "kpi_engagement_rate": 5.0,
  "kpi_link_clicks": 1000,
  "kpi_posts_per_month": 20,
  "audience_age_range": "25-40",
  "audience_gender": "all",
  "audience_locations": ["Jakarta", "Surabaya", "Bandung"],
  "audience_interests": ["kopi", "cafe hopping", "lifestyle"],
  "audience_professions": ["profesional muda", "mahasiswa"]
}
```

**Response 200:** Updated objectives object

---

### PUT `/clients/:id/strategy`

**Request:**
```json
{
  "strategy_text": "Fokus pada educational content tentang kopi Nusantara...",
  "content_pillars": ["Edukasi Kopi", "Behind The Scenes", "Lifestyle", "Promo"],
  "posting_frequency": { "mon": 1, "tue": 1, "wed": 2, "thu": 1, "fri": 2, "sat": 1, "sun": 0 },
  "best_time_to_post": {
    "instagram": ["07:00", "12:00", "19:00"],
    "tiktok": ["20:00", "21:00"],
    "facebook": ["09:00", "15:00"]
  },
  "competitors": ["@kopikinian", "@kopi_kenangan"],
  "campaign_notes": "Q2 2026: Fokus kampanye Hari Kopi Nasional"
}
```

**Response 200:** Updated strategy object

---

## 6. Social Accounts & OAuth

### GET `/clients/:id/social-accounts`

**Response 200:**
```json
{
  "data": [
    {
      "id": "acc_01HXYZ",
      "client_id": "clnt_01HXYZ",
      "platform": "instagram",
      "handle": "@nusantaraRoast",
      "profile_name": "Nusantara Roast",
      "profile_avatar_url": "https://...",
      "followers_count": 12400,
      "followers_synced_at": "2026-04-14T06:00:00Z",
      "token_expires_at": "2026-06-14T00:00:00Z",
      "status": "connected",
      "connected_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

---

### GET `/oauth/:platform/authorize`

Initiate OAuth flow. Redirect user ke authorization page platform.

**Query params:**
- `client_id` (required) — ID client yang akan dihubungkan
- `redirect_uri` (optional) — override callback URL

**Response:** HTTP 302 Redirect ke OAuth provider

---

### GET `/oauth/:platform/callback`

Handle OAuth callback dari platform.  
**Response:** HTTP 302 Redirect ke `{frontend}/clients/{id}/setup?step=socials&status=success`

---

### DELETE `/clients/:id/social-accounts/:acc_id`

Disconnect akun sosmed.  
**Response 200:**
```json
{ "id": "acc_01HXYZ", "platform": "instagram", "status": "disconnected" }
```

---

### POST `/clients/:id/social-accounts/:acc_id/refresh`

Force refresh token.  
**Response 200:**
```json
{
  "id": "acc_01HXYZ",
  "platform": "instagram",
  "status": "connected",
  "token_expires_at": "2026-07-14T00:00:00Z",
  "refreshed_at": "2026-04-14T09:00:00Z"
}
```

---

### GET `/clients/:id/social-accounts/:acc_id/stats`

Fetch latest stats dari platform API.

**Response 200:**
```json
{
  "platform": "instagram",
  "followers_count": 12450,
  "following_count": 180,
  "posts_count": 234,
  "avg_reach_30d": 8200,
  "avg_engagement_rate_30d": 5.4,
  "synced_at": "2026-04-14T09:05:00Z"
}
```

---

## 7. Client Credentials

### GET `/clients/:id/credentials`

Value tidak pernah di-return (hanya preview 4 karakter terakhir).

**Response 200:**
```json
{
  "data": [
    {
      "id": "cred_01HXYZ",
      "key_type": "ga_measurement_id",
      "label": "Google Analytics — Main Property",
      "value_preview": "...XXXXX",
      "is_active": true,
      "created_at": "2026-02-10T10:00:00Z"
    }
  ]
}
```

---

### POST `/clients/:id/credentials`

**Request:**
```json
{
  "key_type": "ga_measurement_id",
  "label": "Google Analytics — Main Property",
  "value": "G-XXXXXXXXXX",
  "notes": "Property untuk website utama"
}
```

**Response 201:** Credential object (tanpa value)

---

### DELETE `/clients/:id/credentials/:cred_id`

**Response 204:** No Content

---

## 8. Posts

### GET `/clients/:id/posts`

**Query params:**
- `status` — `draft` | `scheduled` | `published` | `failed`
- `platform` — filter platform
- `from` / `to` — date range (ISO 8601)
- `page`, `per_page`

**Response 200:**
```json
{
  "data": [
    {
      "id": "post_01HXYZ",
      "client_id": "clnt_01HXYZ",
      "caption": "Pagi yang sempurna dimulai dari...",
      "hashtags": ["#kopinusantara", "#morningcoffee"],
      "image_url": "https://cdn.sociostudio.id/media/...",
      "post_type": "feed",
      "status": "scheduled",
      "scheduled_at": "2026-04-15T07:00:00Z",
      "timezone": "Asia/Jakarta",
      "platforms": [
        { "platform": "instagram", "status": "pending" },
        { "platform": "facebook", "status": "pending" }
      ],
      "ai_generated": true,
      "created_by": "usr_01HXYZ",
      "created_at": "2026-04-14T08:00:00Z"
    }
  ],
  "meta": { "total": 142, "page": 1, "per_page": 20 }
}
```

---

### POST `/clients/:id/posts`

**Request:**
```json
{
  "caption": "Pagi yang sempurna dimulai dari secangkir kopi Flores Bajawa ☕",
  "hashtags": ["#kopinusantara", "#floresbajawa", "#morningcoffee"],
  "image_url": "https://cdn.sociostudio.id/media/img_01HXYZ.webp",
  "post_type": "feed",
  "ai_generated": true,
  "research_session_id": "res_01HXYZ"
}
```

**Response 201:** Post object dengan status `draft`

---

### PATCH `/clients/:id/posts/:post_id`

**Request:** Partial update  
**Response 200:** Updated post object

---

### POST `/clients/:id/posts/:post_id/schedule`

**Request:**
```json
{
  "scheduled_at": "2026-04-15T07:00:00Z",
  "timezone": "Asia/Jakarta",
  "platforms": ["instagram", "facebook"]
}
```

**Response 200:**
```json
{
  "id": "post_01HXYZ",
  "status": "scheduled",
  "scheduled_at": "2026-04-15T07:00:00Z",
  "platforms": [
    { "platform": "instagram", "status": "pending" },
    { "platform": "facebook", "status": "pending" }
  ]
}
```

---

### POST `/clients/:id/posts/:post_id/publish-now`

**Request:**
```json
{
  "platforms": ["instagram", "facebook", "threads"],
  "post_type": "feed",
  "fb_page_id": "123456789"
}
```

**Response 200:**
```json
{
  "post_id": "post_01HXYZ",
  "overall_status": "partial_success",
  "results": [
    {
      "platform": "instagram",
      "status": "published",
      "external_id": "17854321098765",
      "external_url": "https://www.instagram.com/p/ABC123/",
      "published_at": "2026-04-14T09:00:01Z"
    },
    {
      "platform": "facebook",
      "status": "published",
      "external_id": "123456789_987654321",
      "published_at": "2026-04-14T09:00:02Z"
    },
    {
      "platform": "threads",
      "status": "failed",
      "error_code": "MEDIA_FORMAT_UNSUPPORTED",
      "error_message": "Video format not supported. Use MP4.",
      "attempt_count": 1,
      "next_retry_at": "2026-04-14T09:05:00Z"
    }
  ]
}
```

---

### POST `/clients/:id/posts/:post_id/cancel`

Batalkan scheduling (kembali ke draft).  
**Response 200:**
```json
{ "id": "post_01HXYZ", "status": "draft", "cancelled_at": "2026-04-14T09:30:00Z" }
```

---

### GET `/clients/:id/calendar`

**Query params:**
- `year` (required)
- `month` (required, 1–12)
- `platform` — filter platform

**Response 200:**
```json
{
  "year": 2026,
  "month": 4,
  "events": [
    {
      "date": "2026-04-15",
      "posts": [
        {
          "id": "post_01HXYZ",
          "caption_preview": "Pagi yang sempurna...",
          "time": "07:00",
          "timezone": "Asia/Jakarta",
          "platforms": ["instagram", "facebook"],
          "status": "scheduled"
        }
      ]
    }
  ]
}
```

---

## 9. AI Generation

> Semua endpoint AI di-rate-limit 30 req/menit per org.  
> Endpoint research dan caption menggunakan **Server-Sent Events (SSE)**.

### POST `/ai/research`

**Content-Type response:** `text/event-stream`

**Request:**
```json
{
  "client_id": "clnt_01HXYZ",
  "query": "konten tentang kopi Flores untuk Hari Kopi Nasional",
  "platform": "instagram"
}
```

**SSE Stream:**
```
event: chunk
data: {"type":"text","text":"## Analisis Tren\n\nKopi Flores Bajawa sedang..."}

event: chunk
data: {"type":"text","text":" naik daun di kalangan coffee enthusiast..."}

event: done
data: {"session_id":"res_01HXYZ","tokens_used":342,"model":"claude-sonnet-4-20250514"}
```

---

### POST `/ai/caption`

**Content-Type response:** `text/event-stream`

**Request:**
```json
{
  "client_id": "clnt_01HXYZ",
  "topic": "foto morning ritual dengan kopi Flores Bajawa",
  "platform": "instagram",
  "tone_override": null,
  "language": "id",
  "hashtag_count": 20
}
```

**SSE Stream:**
```
event: chunk
data: {"type":"caption","text":"Pagi yang sempurna dimulai dari"}

event: chunk
data: {"type":"caption","text":" secangkir kopi Flores Bajawa ☕\n\nAroma yang menguar..."}

event: chunk
data: {"type":"hashtag","text":"#kopinusantara #floresbajawa #morningcoffee"}

event: done
data: {"tokens_used":425,"caption_chars":280,"hashtag_count":20}
```

---

### POST `/ai/caption/regenerate`

Regenerate dengan variasi berbeda. Sama dengan `/ai/caption` tapi menyertakan previous output untuk dihindari.

**Request:**
```json
{
  "client_id": "clnt_01HXYZ",
  "topic": "foto morning ritual dengan kopi Flores Bajawa",
  "platform": "instagram",
  "previous_caption": "Pagi yang sempurna dimulai dari...",
  "variation_hint": "lebih personal, pakai sudut pandang orang pertama"
}
```

---

### POST `/ai/image/generate`

**Request:**
```json
{
  "client_id": "clnt_01HXYZ",
  "prompt": "secangkir kopi di meja kayu dengan bunga chamomile, pencahayaan golden hour",
  "style": "photography",
  "aspect_ratio": "1:1",
  "platform_preset": "instagram"
}
```

**Response 200:**
```json
{
  "image_url": "https://cdn.sociostudio.id/media/gen_01HXYZ.webp",
  "media_asset_id": "med_01HXYZ",
  "width": 1024,
  "height": 1024,
  "model_used": "stability-sdxl-1.0",
  "prompt_used": "secangkir kopi di meja kayu dengan bunga chamomile...",
  "tokens_used": 0,
  "cost_usd": 0.0020
}
```

---

### POST `/ai/video/generate`

Job async — return job ID, polling di endpoint berikutnya.

**Request:**
```json
{
  "client_id": "clnt_01HXYZ",
  "source_image_url": "https://cdn.sociostudio.id/media/img_01HXYZ.webp",
  "motion_effect": "ken_burns",
  "duration_sec": 5,
  "resolution_preset": "instagram_feed",
  "music_track_id": "bgm_upbeat_01",
  "motion_description": "Slowly zoom into the coffee cup"
}
```

**Response 202:**
```json
{
  "job_id": "vjob_01HXYZ",
  "status": "queued",
  "estimated_seconds": 120,
  "poll_url": "/v1/ai/video/vjob_01HXYZ/status"
}
```

---

### GET `/ai/video/:job_id/status`

**Response 200:**
```json
{
  "job_id": "vjob_01HXYZ",
  "status": "processing",
  "progress_percent": 65,
  "estimated_seconds_remaining": 45,
  "result": null
}
```

**Response 200 (selesai):**
```json
{
  "job_id": "vjob_01HXYZ",
  "status": "done",
  "progress_percent": 100,
  "result": {
    "video_url": "https://cdn.sociostudio.id/media/vid_01HXYZ.mp4",
    "media_asset_id": "med_01HXYZ",
    "duration_sec": 5,
    "resolution": "1080x1080",
    "size_bytes": 4200000
  }
}
```

---

### GET `/ai/usage`

**Query params:** `month` (YYYY-MM, default bulan ini)

**Response 200:**
```json
{
  "period": "2026-04",
  "caption_generates": { "used": 48, "limit": null, "cost_usd": 0.96 },
  "image_generates": { "used": 23, "limit": null, "cost_usd": 0.046 },
  "video_generates": { "used": 5, "limit": null, "cost_usd": 0.25 },
  "research_sessions": { "used": 31, "limit": null, "cost_usd": 0.62 },
  "total_tokens": { "input": 124500, "output": 89200 },
  "total_cost_usd": 1.876
}
```

---

## 10. Media Assets

### GET `/clients/:id/media`

**Query params:** `type` (image/video), `source` (upload/ai_generated), `page`, `per_page`

**Response 200:**
```json
{
  "data": [
    {
      "id": "med_01HXYZ",
      "filename": "kopi_morning.webp",
      "public_url": "https://cdn.sociostudio.id/media/med_01HXYZ.webp",
      "type": "image",
      "mime_type": "image/webp",
      "size_bytes": 245000,
      "width": 1024,
      "height": 1024,
      "thumbnail_url": "https://cdn.sociostudio.id/media/med_01HXYZ_thumb.webp",
      "source": "ai_generated",
      "ai_prompt": "secangkir kopi di meja kayu...",
      "uploaded_by": "usr_01HXYZ",
      "created_at": "2026-04-14T08:00:00Z"
    }
  ],
  "storage_used_bytes": 3440123904,
  "storage_quota_bytes": 107374182400
}
```

---

### POST `/clients/:id/media/upload`

**Content-Type:** `multipart/form-data`

**Form fields:**
- `file` — binary file
- `alt_text` — teks alt (optional)
- `tags` — array tags (optional)

**Response 201:** Media asset object

---

### DELETE `/clients/:id/media/:media_id`

**Response 200:**
```json
{
  "id": "med_01HXYZ",
  "deleted": true,
  "used_in_posts": 0,
  "warning": null
}
```

Jika `used_in_posts > 0`, response tetap 200 tapi dengan `warning: "Media ini digunakan di 2 post. Post tersebut akan kehilangan medianya."` — tidak otomatis hapus.

---

## 11. Analytics

### GET `/clients/:id/analytics/overview`

**Query params:** `period` — `7d` | `30d` | `90d` (default: `30d`)

**Response 200:**
```json
{
  "period": "30d",
  "summary": {
    "total_reach": 128400,
    "total_impressions": 245000,
    "engagement_rate": 5.2,
    "followers_gained": 340,
    "link_clicks": 3400,
    "posts_published": 18
  },
  "comparison": {
    "reach_change_pct": 31.2,
    "engagement_change_pct": 0.6,
    "followers_change_pct": 22.1
  },
  "synced_at": "2026-04-14T06:00:00Z"
}
```

---

### GET `/clients/:id/analytics/posts`

Top performing posts.

**Query params:** `sort` — `reach` | `engagement` | `clicks`, `limit` (default: 10)

**Response 200:**
```json
{
  "data": [
    {
      "post_id": "post_01HXYZ",
      "platform": "instagram",
      "caption_preview": "Sunrise di Bromo...",
      "published_at": "2026-04-12T07:00:00Z",
      "stats": {
        "reach": 8400,
        "impressions": 12300,
        "likes": 654,
        "comments": 89,
        "shares": 43,
        "saves": 201,
        "engagement_rate": 12.3
      }
    }
  ]
}
```

---

### GET `/analytics/agency-overview`

Overview semua client di org.

**Response 200:**
```json
{
  "clients": [
    {
      "id": "clnt_01HXYZ",
      "name": "Nusantara Roast",
      "color": "#BA7517",
      "posts_this_month": 18,
      "reach_this_month": 42000,
      "engagement_rate": 5.2,
      "alerts": [
        { "type": "token_expiring", "platform": "facebook", "message": "Token Facebook expired dalam 5 hari" }
      ]
    }
  ]
}
```

---

## 12. Team Management

### GET `/org/members`

**Response 200:**
```json
{
  "data": [
    {
      "id": "usr_01HXYZ",
      "email": "dinda@kreatif.id",
      "full_name": "Dinda Pratiwi",
      "role": "owner",
      "avatar_url": null,
      "is_active": true,
      "joined_at": "2026-01-01T00:00:00Z",
      "last_seen_at": "2026-04-14T08:45:00Z"
    }
  ],
  "pending_invitations": [
    {
      "email": "rizal@kreatif.id",
      "role": "editor",
      "invited_at": "2026-04-13T10:00:00Z",
      "expires_at": "2026-04-15T10:00:00Z"
    }
  ]
}
```

---

### POST `/org/members/invite`

**Request:**
```json
{
  "email": "rizal@kreatif.id",
  "role": "editor"
}
```

**Response 201:**
```json
{ "email": "rizal@kreatif.id", "role": "editor", "invitation_sent": true, "expires_at": "2026-04-16T10:00:00Z" }
```

---

### PATCH `/org/members/:user_id/role`

**Request:**
```json
{ "role": "admin" }
```

**Response 200:** Updated user object

---

### DELETE `/org/members/:user_id`

Hapus member dari org.  
**Response 200:**
```json
{ "user_id": "usr_01HXYZ", "removed": true }
```

---

## 13. Notifications

### GET `/notifications`

**Query params:** `unread_only` (boolean), `page`, `per_page`

**Response 200:**
```json
{
  "data": [
    {
      "id": "notif_01HXYZ",
      "type": "post_published",
      "title": "Post berhasil dipublish",
      "body": "Post 'Pagi yang sempurna...' telah live di Instagram",
      "action_url": "/clients/clnt_01HXYZ/posts/post_01HXYZ",
      "is_read": false,
      "created_at": "2026-04-14T07:00:05Z"
    }
  ],
  "unread_count": 3
}
```

---

### POST `/notifications/mark-read`

**Request:**
```json
{ "notification_ids": ["notif_01HXYZ", "notif_02HXYZ"] }
// atau:
{ "all": true }
```

**Response 200:**
```json
{ "marked_count": 3 }
```

---

## 14. Billing

### GET `/billing/plans`

Daftar plan dan harga (public endpoint, tidak perlu auth).

**Response 200:**
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "price_idr_monthly": 299000,
      "price_idr_yearly": 2868000,
      "features": {
        "max_clients": 3,
        "max_members": 1,
        "max_posts_per_month": 60,
        "max_ai_image": 30,
        "max_ai_video": 5,
        "storage_gb": 5,
        "platforms": 3
      }
    }
  ]
}
```

---

### POST `/billing/subscribe`

**Request:**
```json
{
  "plan": "pro",
  "billing_period": "monthly",
  "payment_method": "stripe",
  "success_url": "https://app.sociostudio.id/billing/success",
  "cancel_url": "https://app.sociostudio.id/billing/cancel"
}
```

**Response 200:**
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_...",
  "session_id": "cs_..."
}
```

---

## 15. Error Reference

### Standard Error Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Client dengan ID clnt_01HXYZ tidak ditemukan",
    "details": null,
    "request_id": "req_01HXYZ"
  }
}
```

### HTTP Status Codes

| Status | Keterangan |
|---|---|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (async job) |
| 204 | No Content |
| 400 | Bad Request — input tidak valid |
| 401 | Unauthorized — token tidak ada atau expired |
| 403 | Forbidden — tidak punya permission |
| 404 | Not Found |
| 409 | Conflict — data sudah ada (cth: email duplikat) |
| 422 | Unprocessable Entity — validasi gagal |
| 429 | Too Many Requests — rate limit |
| 500 | Internal Server Error |
| 503 | Service Unavailable — AI provider down |

### Error Codes

| Code | Deskripsi |
|---|---|
| `INVALID_TOKEN` | JWT tidak valid atau expired |
| `INSUFFICIENT_PERMISSIONS` | Role tidak punya akses |
| `RESOURCE_NOT_FOUND` | Resource tidak ditemukan |
| `VALIDATION_FAILED` | Input tidak memenuhi schema |
| `RATE_LIMIT_EXCEEDED` | Terlalu banyak request |
| `PLAN_LIMIT_REACHED` | Sudah mencapai batas plan |
| `OAUTH_FAILED` | OAuth authorization gagal |
| `TOKEN_EXPIRED` | Social media token expired |
| `PLATFORM_API_ERROR` | Platform API return error |
| `MEDIA_TOO_LARGE` | File melebihi batas ukuran |
| `MEDIA_FORMAT_UNSUPPORTED` | Format file tidak didukung platform |
| `AI_PROVIDER_ERROR` | AI provider tidak tersedia |
| `ENCRYPTION_ERROR` | Error enkripsi/dekripsi credential |
| `DUPLICATE_PLATFORM` | Platform sudah terhubung untuk client ini |
