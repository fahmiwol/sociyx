# SocioStudio — Entity Relationship Document (ERD)

**Version:** 1.0.0  
**Database:** PostgreSQL 16 via Supabase  
**Strategy:** Multi-tenant dengan Row Level Security (RLS)

---

## Table of Contents

1. [Entity Overview](#1-entity-overview)
2. [Schema Definitions](#2-schema-definitions)
3. [Relationships](#3-relationships)
4. [ERD Diagram (Text)](#4-erd-diagram-text)
5. [Indexes](#5-indexes)
6. [RLS Policies](#6-rls-policies)
7. [Enums](#7-enums)

---

## 1. Entity Overview

| Tabel | Deskripsi | Rows Estimasi (per org) |
|---|---|---|
| `organizations` | Agensi / akun utama | 1 |
| `users` | Anggota tim dengan role | 1–20 |
| `clients` | Brand / client yang dikelola | 3–50 |
| `client_brand_guidelines` | Brand guidelines per client | 1:1 dengan clients |
| `client_objectives` | KPI dan target per client | 1:1 dengan clients |
| `client_strategy` | Strategi konten per client | 1:1 dengan clients |
| `social_accounts` | Akun sosmed yang terhubung per client | 1–8 per client |
| `client_credentials` | API keys & credentials tambahan | 1–15 per client |
| `posts` | Konten (draft/scheduled/published) | 10–500 per client/bulan |
| `post_platforms` | Status publish per platform per post | 1–6 per post |
| `media_assets` | Library gambar/video per client | 50–500 per client |
| `research_sessions` | History riset konten AI | 10–100 per client/bulan |
| `caption_templates` | Template caption tersimpan | 0–50 per client |
| `usage_logs` | Tracking penggunaan AI (untuk billing) | Tinggi — aggregate |
| `notifications` | In-app notifikasi per user | 0–100 per user |
| `billing_subscriptions` | Subscription plan per org | 1 per org |
| `audit_logs` | Log semua aksi penting | Tinggi |

---

## 2. Schema Definitions

### 2.1 `organizations`

```sql
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,           -- untuk subdomain/URL
  logo_url        TEXT,
  plan            TEXT NOT NULL DEFAULT 'starter', -- starter|pro|agency|enterprise
  plan_expires_at TIMESTAMPTZ,
  owner_id        UUID NOT NULL REFERENCES users(id),
  settings        JSONB NOT NULL DEFAULT '{}',    -- notif prefs, timezone default, dll
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**settings JSONB shape:**
```json
{
  "timezone": "Asia/Jakarta",
  "default_language": "id",
  "notification_email": true,
  "notification_inapp": true,
  "ai_provider_image": "stability",
  "ai_provider_video": "runway"
}
```

---

### 2.2 `users`

```sql
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email        TEXT UNIQUE NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'editor',  -- owner|admin|editor|viewer
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by   UUID REFERENCES users(id),
  last_seen_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auth dihandle Supabase Auth (auth.users)
-- users.id = auth.users.id (linked via trigger)
```

---

### 2.3 `clients`

```sql
CREATE TABLE clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  industry     TEXT NOT NULL,
  website      TEXT,
  tagline      TEXT,
  description  TEXT,
  year_founded INTEGER,
  location     TEXT,
  logo_url     TEXT,
  color        TEXT NOT NULL DEFAULT '#1a6cff',  -- warna avatar/pill di UI
  initials     TEXT NOT NULL,                    -- 2 karakter, auto-generate
  status       TEXT NOT NULL DEFAULT 'active',  -- active|inactive|archived
  created_by   UUID NOT NULL REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.4 `client_brand_guidelines`

```sql
CREATE TABLE client_brand_guidelines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tone             TEXT,                        -- "hangat, storytelling, premium lokal"
  tone_preset      TEXT,                        -- enum key lihat section 7
  primary_color    TEXT,                        -- hex: "#6B3A1F"
  secondary_color  TEXT,
  accent_colors    TEXT[] DEFAULT '{}',
  font_primary     TEXT,
  font_secondary   TEXT,
  language         TEXT NOT NULL DEFAULT 'id', -- id|en|bilingual
  blacklist_words  TEXT[] DEFAULT '{}',
  asset_canva_url  TEXT,
  asset_gdrive_url TEXT,
  asset_figma_url  TEXT,
  asset_pdf_url    TEXT,
  extra_notes      TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.5 `client_objectives`

```sql
CREATE TABLE client_objectives (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  objective_type        TEXT NOT NULL DEFAULT 'brand_awareness',
  -- brand_awareness|sales_conversion|community_building|
  -- thought_leadership|website_traffic|recruitment

  -- KPI Targets (per bulan)
  kpi_followers_new     INTEGER,
  kpi_reach             INTEGER,
  kpi_engagement_rate   NUMERIC(5,2),           -- persentase, cth: 4.50
  kpi_link_clicks       INTEGER,
  kpi_posts_per_month   INTEGER,

  -- Target Audience
  audience_age_range    TEXT,                   -- "22-35"
  audience_gender       TEXT DEFAULT 'all',     -- all|female_majority|male_majority
  audience_locations    TEXT[] DEFAULT '{}',
  audience_interests    TEXT[] DEFAULT '{}',
  audience_professions  TEXT[] DEFAULT '{}',

  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.6 `client_strategy`

```sql
CREATE TABLE client_strategy (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  strategy_text     TEXT,
  content_pillars   TEXT[] DEFAULT '{}',
  posting_frequency JSONB DEFAULT '{"mon":1,"tue":1,"wed":1,"thu":1,"fri":1,"sat":1,"sun":0}',
  best_time_to_post JSONB DEFAULT '{}',
  -- { "instagram": ["07:00","12:00","19:00"], "tiktok": ["20:00"] }
  competitors       TEXT[] DEFAULT '{}',
  campaign_notes    TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.7 `social_accounts`

```sql
CREATE TABLE social_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  org_id              UUID NOT NULL REFERENCES organizations(id),
  platform            TEXT NOT NULL,
  -- instagram|tiktok|facebook|twitter|threads|youtube|linkedin|pinterest

  handle              TEXT,                      -- "@nusantaraRoast"
  profile_url         TEXT,
  profile_name        TEXT,                      -- display name dari API
  profile_avatar_url  TEXT,
  followers_count     INTEGER,                   -- cached dari API
  followers_synced_at TIMESTAMPTZ,

  -- Tokens (encrypted via Supabase Vault)
  access_token_enc    TEXT,                      -- encrypted ciphertext
  refresh_token_enc   TEXT,
  token_expires_at    TIMESTAMPTZ,
  token_scope         TEXT,                      -- scopes yang diberikan user

  -- OAuth metadata
  external_user_id    TEXT,                      -- user ID dari platform
  external_page_id    TEXT,                      -- untuk Facebook Page
  oauth_state         TEXT,                      -- CSRF state sementara

  status              TEXT NOT NULL DEFAULT 'disconnected',
  -- connected|expired|error|disconnected

  last_error          TEXT,
  connected_at        TIMESTAMPTZ,
  connected_by        UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(client_id, platform)
);
```

---

### 2.8 `client_credentials`

```sql
CREATE TABLE client_credentials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id),
  key_type    TEXT NOT NULL,
  -- ig_access_token|tt_api_key|fb_page_token|tw_bearer_token|
  -- yt_channel_id|ga_measurement_id|meta_business_id|
  -- canva_brand_kit|gdrive_folder|other

  label       TEXT NOT NULL,                     -- nama tampilan user
  value_enc   TEXT NOT NULL,                     -- encrypted AES-256-GCM
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  notes       TEXT,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.9 `posts`

```sql
CREATE TABLE posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id),

  -- Content
  caption         TEXT,
  hashtags        TEXT[] DEFAULT '{}',
  image_url       TEXT,                          -- URL ke Supabase Storage
  video_url       TEXT,
  thumbnail_url   TEXT,                          -- untuk video
  post_type       TEXT NOT NULL DEFAULT 'feed',  -- feed|story|reel|short|thread

  -- AI metadata
  ai_generated    BOOLEAN DEFAULT FALSE,
  ai_prompt_used  TEXT,
  research_session_id UUID REFERENCES research_sessions(id),

  -- Scheduling
  status          TEXT NOT NULL DEFAULT 'draft',
  -- draft|scheduled|publishing|published|failed|cancelled

  scheduled_at    TIMESTAMPTZ,
  timezone        TEXT DEFAULT 'Asia/Jakarta',
  published_at    TIMESTAMPTZ,

  -- Workflow
  submitted_by    UUID REFERENCES users(id),
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  rejection_note  TEXT,

  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.10 `post_platforms`

```sql
CREATE TABLE post_platforms (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id        UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  platform       TEXT NOT NULL,
  social_account_id UUID REFERENCES social_accounts(id),

  status         TEXT NOT NULL DEFAULT 'pending',
  -- pending|publishing|published|failed|skipped

  external_id    TEXT,                           -- post ID dari platform
  external_url   TEXT,                           -- URL post di platform
  error_code     TEXT,
  error_message  TEXT,

  -- Retry logic
  attempt_count  INTEGER NOT NULL DEFAULT 0,
  next_retry_at  TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,

  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(post_id, platform)
);
```

---

### 2.11 `media_assets`

```sql
CREATE TABLE media_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id),

  filename        TEXT NOT NULL,
  storage_path    TEXT NOT NULL,                 -- path di Supabase Storage bucket
  public_url      TEXT NOT NULL,

  type            TEXT NOT NULL,                 -- image|video|gif
  mime_type       TEXT NOT NULL,                 -- image/jpeg, video/mp4, dll
  size_bytes      INTEGER NOT NULL,
  width           INTEGER,
  height          INTEGER,
  duration_sec    NUMERIC(8,2),                  -- untuk video

  -- Processing
  is_processed    BOOLEAN DEFAULT FALSE,
  thumbnail_url   TEXT,
  variants        JSONB DEFAULT '{}',
  -- { "webp": "url", "thumb_200": "url", "thumb_400": "url" }

  -- AI generation metadata
  source          TEXT DEFAULT 'upload',         -- upload|ai_generated|editor_export|video_generated
  ai_prompt       TEXT,
  ai_model        TEXT,

  alt_text        TEXT,
  tags            TEXT[] DEFAULT '{}',

  uploaded_by     UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.12 `research_sessions`

```sql
CREATE TABLE research_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  org_id       UUID NOT NULL REFERENCES organizations(id),
  user_id      UUID NOT NULL REFERENCES users(id),

  query        TEXT NOT NULL,
  ai_response  TEXT,
  platform     TEXT,                             -- platform context saat riset
  model_used   TEXT,
  tokens_used  INTEGER,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.13 `caption_templates`

```sql
CREATE TABLE caption_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,  -- NULL = org-wide template
  org_id      UUID NOT NULL REFERENCES organizations(id),

  name        TEXT NOT NULL,
  platform    TEXT,                              -- NULL = semua platform
  tone        TEXT,
  caption     TEXT NOT NULL,
  hashtags    TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,

  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.14 `usage_logs`

```sql
CREATE TABLE usage_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id),
  client_id    UUID REFERENCES clients(id),
  user_id      UUID REFERENCES users(id),

  action_type  TEXT NOT NULL,
  -- caption_generate|image_generate|video_generate|research|publish|media_upload

  model_used   TEXT,                             -- claude-sonnet-4-..., sdxl, runway-gen3
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_usd     NUMERIC(10,6),                    -- estimasi biaya dalam USD

  metadata     JSONB DEFAULT '{}',               -- extra info per action_type
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.15 `billing_subscriptions`

```sql
CREATE TABLE billing_subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID UNIQUE NOT NULL REFERENCES organizations(id),

  plan                  TEXT NOT NULL DEFAULT 'starter',
  status                TEXT NOT NULL DEFAULT 'active',
  -- active|past_due|cancelled|trialing

  -- Limits
  max_clients           INTEGER,                 -- NULL = unlimited
  max_members           INTEGER,
  max_posts_per_month   INTEGER,
  max_ai_image_per_month INTEGER,
  max_ai_video_per_month INTEGER,
  storage_gb            INTEGER,

  -- Stripe / Midtrans
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  midtrans_subscription_id TEXT,

  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  trial_ends_at         TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.16 `notifications`

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  user_id     UUID NOT NULL REFERENCES users(id),

  type        TEXT NOT NULL,
  -- post_published|post_failed|token_expired|approval_request|
  -- approval_approved|approval_rejected|member_invited|usage_limit

  title       TEXT NOT NULL,
  body        TEXT,
  action_url  TEXT,
  metadata    JSONB DEFAULT '{}',

  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.17 `audit_logs`

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  user_id     UUID REFERENCES users(id),

  action      TEXT NOT NULL,
  -- client.create|client.update|client.delete|
  -- post.publish|post.delete|member.invite|member.remove|
  -- credential.create|credential.delete|oauth.connect|oauth.disconnect

  entity_type TEXT,
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  TEXT,
  user_agent  TEXT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Relationships

```
organizations
  ├── 1:N  users
  ├── 1:N  clients
  │           ├── 1:1  client_brand_guidelines
  │           ├── 1:1  client_objectives
  │           ├── 1:1  client_strategy
  │           ├── 1:N  social_accounts
  │           ├── 1:N  client_credentials
  │           ├── 1:N  posts
  │           │           └── 1:N  post_platforms
  │           ├── 1:N  media_assets
  │           ├── 1:N  research_sessions
  │           └── 1:N  caption_templates (atau org-wide)
  ├── 1:1  billing_subscriptions
  ├── 1:N  usage_logs
  ├── 1:N  audit_logs
  └── 1:N  notifications (via users)
```

---

## 4. ERD Diagram (Text)

```
┌─────────────────────┐
│    organizations    │
│─────────────────────│
│ id (PK)             │◄──┐
│ name                │   │
│ slug (UNIQUE)       │   │
│ plan                │   │
│ owner_id (FK users) │   │
│ settings (JSONB)    │   │
└────────┬────────────┘   │
         │ 1              │
         │                │
         │ N              │
┌────────▼────────────┐   │
│       users         │   │
│─────────────────────│   │
│ id (PK)             │   │
│ org_id (FK)     ────┼───┘
│ email (UNIQUE)      │
│ role                │
│ is_active           │
└─────────────────────┘

┌─────────────────────┐
│      clients        │
│─────────────────────│
│ id (PK)             │◄────────────────────────────────┐
│ org_id (FK)         │                                 │
│ name                │                                 │
│ industry            │                                 │
│ color               │                                 │
│ initials            │                                 │
│ status              │                                 │
└──┬──────────────────┘                                 │
   │                                                     │
   ├──1:1──► client_brand_guidelines                     │
   │          (client_id UNIQUE FK)                      │
   │                                                     │
   ├──1:1──► client_objectives                           │
   │          (client_id UNIQUE FK)                      │
   │                                                     │
   ├──1:1──► client_strategy                             │
   │          (client_id UNIQUE FK)                      │
   │                                                     │
   ├──1:N──► social_accounts                             │
   │          (client_id FK, UNIQUE per platform)        │
   │                                                     │
   ├──1:N──► client_credentials                          │
   │          (client_id FK)                             │
   │                                                     │
   ├──1:N──► media_assets                                │
   │          (client_id FK)                             │
   │                                                     │
   ├──1:N──► research_sessions                           │
   │          (client_id FK)                             │
   │                                                     │
   └──1:N──► posts ──1:N──► post_platforms               │
              │              (post_id FK,                │
              │               platform UNIQUE per post)  │
              │                                          │
              └── social_account_id (FK)  ───────────────┘
                  (references social_accounts)

┌─────────────────────┐
│   billing_subscriptions │
│─────────────────────│
│ id (PK)             │
│ org_id (UNIQUE FK)  │ ←── 1:1 dengan organizations
│ plan                │
│ status              │
│ max_clients         │
│ stripe_customer_id  │
└─────────────────────┘
```

---

## 5. Indexes

```sql
-- organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_owner ON organizations(owner_id);

-- users
CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- clients
CREATE INDEX idx_clients_org ON clients(org_id);
CREATE INDEX idx_clients_status ON clients(org_id, status);

-- social_accounts
CREATE INDEX idx_social_org ON social_accounts(org_id);
CREATE INDEX idx_social_client ON social_accounts(client_id);
CREATE INDEX idx_social_status ON social_accounts(status);
CREATE INDEX idx_social_token_expires ON social_accounts(token_expires_at)
  WHERE status = 'connected';  -- partial index untuk token refresh job

-- posts
CREATE INDEX idx_posts_client ON posts(client_id);
CREATE INDEX idx_posts_org_status ON posts(org_id, status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at)
  WHERE status = 'scheduled';  -- partial index untuk scheduler job
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- post_platforms
CREATE INDEX idx_pp_post ON post_platforms(post_id);
CREATE INDEX idx_pp_status ON post_platforms(status);
CREATE INDEX idx_pp_retry ON post_platforms(next_retry_at)
  WHERE status = 'failed' AND attempt_count < 3;

-- media_assets
CREATE INDEX idx_media_client ON media_assets(client_id);
CREATE INDEX idx_media_type ON media_assets(client_id, type);

-- usage_logs
CREATE INDEX idx_usage_org_date ON usage_logs(org_id, created_at DESC);
CREATE INDEX idx_usage_action ON usage_logs(action_type, created_at);

-- notifications
CREATE INDEX idx_notif_user_unread ON notifications(user_id, is_read)
  WHERE is_read = FALSE;

-- audit_logs
CREATE INDEX idx_audit_org ON audit_logs(org_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
```

---

## 6. RLS Policies

```sql
-- Aktifkan RLS di semua tabel
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- (dan semua tabel lainnya)

-- Policy: user hanya bisa akses data org sendiri
CREATE POLICY "org_isolation_clients" ON clients
  FOR ALL
  USING (org_id = (
    SELECT org_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "org_isolation_posts" ON posts
  FOR ALL
  USING (org_id = (
    SELECT org_id FROM users WHERE id = auth.uid()
  ));

-- Policy: viewer tidak bisa publish
CREATE POLICY "editor_can_publish" ON posts
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid())
    IN ('owner', 'admin', 'editor')
  );

-- Policy: hanya owner/admin yang bisa hapus client
CREATE POLICY "admin_delete_clients" ON clients
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid())
    IN ('owner', 'admin')
  );

-- Policy: credentials hanya bisa dibaca user dalam org yang sama
CREATE POLICY "org_credentials" ON client_credentials
  FOR ALL
  USING (org_id = (
    SELECT org_id FROM users WHERE id = auth.uid()
  ));
```

---

## 7. Enums

```typescript
// Platform
type Platform =
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'threads'
  | 'youtube'
  | 'linkedin'
  | 'pinterest';

// User Role
type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

// Client Status
type ClientStatus = 'active' | 'inactive' | 'archived';

// Social Account Status
type SocialAccountStatus = 'connected' | 'expired' | 'error' | 'disconnected';

// Post Status
type PostStatus =
  | 'draft'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'cancelled';

// Post Platform Status
type PostPlatformStatus =
  | 'pending'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'skipped';

// Post Type
type PostType = 'feed' | 'story' | 'reel' | 'short' | 'thread' | 'video';

// Objective Type
type ObjectiveType =
  | 'brand_awareness'
  | 'sales_conversion'
  | 'community_building'
  | 'thought_leadership'
  | 'website_traffic'
  | 'recruitment';

// Billing Plan
type BillingPlan = 'starter' | 'pro' | 'agency' | 'enterprise';

// Subscription Status
type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

// Media Source
type MediaSource =
  | 'upload'
  | 'ai_generated'
  | 'editor_export'
  | 'video_generated';

// Usage Action Type
type UsageActionType =
  | 'caption_generate'
  | 'image_generate'
  | 'video_generate'
  | 'research'
  | 'publish'
  | 'media_upload';

// Credential Key Type
type CredentialKeyType =
  | 'ig_access_token'
  | 'tt_api_key'
  | 'fb_page_token'
  | 'tw_bearer_token'
  | 'yt_channel_id'
  | 'ga_measurement_id'
  | 'meta_business_id'
  | 'canva_brand_kit'
  | 'gdrive_folder'
  | 'other';

// Notification Type
type NotificationType =
  | 'post_published'
  | 'post_failed'
  | 'token_expired'
  | 'approval_request'
  | 'approval_approved'
  | 'approval_rejected'
  | 'member_invited'
  | 'usage_limit';

// Tone Preset
type TonePreset =
  | 'warm_storytelling'
  | 'cheerful_casual'
  | 'professional_informative'
  | 'premium_elegant'
  | 'edgy_bold'
  | 'inspirational'
  | 'humorous_genz';

// Language
type ContentLanguage = 'id' | 'en' | 'bilingual';
```
