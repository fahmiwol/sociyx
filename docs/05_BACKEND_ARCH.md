# SocioStudio — Backend Architecture & Infrastructure

**Version:** 1.0.0  
**Stack:** Node.js 20 + TypeScript + Fastify + PostgreSQL + Redis + BullMQ

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Technology Stack Detail](#3-technology-stack-detail)
4. [Service Layer Design](#4-service-layer-design)
5. [Background Jobs (BullMQ)](#5-background-jobs-bullmq)
6. [Security Implementation](#6-security-implementation)
7. [Platform API Integration](#7-platform-api-integration)
8. [AI Integration Layer](#8-ai-integration-layer)
9. [Storage & CDN](#9-storage--cdn)
10. [Environment Variables](#10-environment-variables)
11. [Deployment](#11-deployment)
12. [Monitoring & Alerting](#12-monitoring--alerting)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│    Browser (Next.js 14)  |  Mobile PWA  |  API Consumer  │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / SSE
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   CLOUDFLARE EDGE                        │
│           CDN + DDoS + WAF + Rate Limit Layer            │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    API SERVER                            │
│          Fastify v4 + TypeScript (Node.js 20)            │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Auth     │  │ Clients  │  │ Posts    │  │  AI    │  │
│  │ Module   │  │ Module   │  │ Module   │  │ Module │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ OAuth    │  │ Media    │  │Analytics │  │Billing │  │
│  │ Module   │  │ Module   │  │ Module   │  │ Module │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
     ┌─────▼─────┐              ┌─────▼──────┐
     │ PostgreSQL │              │   Redis    │
     │ (Supabase) │              │ (Upstash)  │
     │            │              │            │
     │ - RLS      │              │ - Session  │
     │ - Vault    │              │ - BullMQ   │
     │ - Realtime │              │ - Rate Lmt │
     └────────────┘              └─────┬──────┘
                                       │
                                 ┌─────▼──────┐
                                 │  BullMQ    │
                                 │  Workers   │
                                 │            │
                                 │ - publish  │
                                 │ - refresh  │
                                 │ - analytics│
                                 │ - video    │
                                 └─────┬──────┘
                                       │
           ┌───────────────────────────┼────────────────────┐
           │                           │                    │
     ┌─────▼─────┐              ┌──────▼─────┐      ┌──────▼─────┐
     │ Supabase  │              │ Platform   │      │    AI      │
     │ Storage   │              │ APIs       │      │ Providers  │
     │           │              │            │      │            │
     │ S3-compat │              │ IG/TT/FB   │      │ Anthropic  │
     │ CDN auto  │              │ X/YT/Thrd  │      │ Stability  │
     └───────────┘              └────────────┘      │ Runway ML  │
                                                    └────────────┘
```

---

## 2. Project Structure

```
sociostudio-api/
├── src/
│   ├── app.ts                    # Fastify instance + plugin registration
│   ├── server.ts                 # Entry point
│   │
│   ├── config/
│   │   ├── env.ts                # Zod env validation
│   │   ├── database.ts           # Supabase client + Drizzle ORM setup
│   │   └── redis.ts              # Upstash Redis client
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts    # Zod schemas + JSON Schema
│   │   │   └── auth.test.ts
│   │   ├── clients/
│   │   │   ├── clients.routes.ts
│   │   │   ├── clients.service.ts
│   │   │   ├── clients.schema.ts
│   │   │   └── clients.test.ts
│   │   ├── posts/
│   │   ├── social-accounts/
│   │   ├── ai/
│   │   ├── media/
│   │   ├── analytics/
│   │   ├── billing/
│   │   └── notifications/
│   │
│   ├── jobs/                     # BullMQ job definitions
│   │   ├── queues.ts             # Queue instances
│   │   ├── workers/
│   │   │   ├── publish.worker.ts
│   │   │   ├── token-refresh.worker.ts
│   │   │   ├── analytics-sync.worker.ts
│   │   │   ├── media-process.worker.ts
│   │   │   └── video-poll.worker.ts
│   │   └── schedulers/
│   │       └── cron.ts           # Cron job definitions
│   │
│   ├── integrations/
│   │   ├── platforms/
│   │   │   ├── instagram.ts
│   │   │   ├── tiktok.ts
│   │   │   ├── facebook.ts
│   │   │   ├── twitter.ts
│   │   │   ├── threads.ts
│   │   │   └── youtube.ts
│   │   ├── ai/
│   │   │   ├── anthropic.ts
│   │   │   ├── stability.ts
│   │   │   └── runway.ts
│   │   └── storage/
│   │       └── supabase-storage.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verify + user inject
│   │   ├── rls.middleware.ts     # Set Supabase RLS context
│   │   ├── rate-limit.ts
│   │   └── audit.ts             # Audit log hook
│   │
│   ├── lib/
│   │   ├── encryption.ts        # AES-256-GCM encrypt/decrypt
│   │   ├── brand-context.ts     # Build AI system prompt dari brand guidelines
│   │   ├── platform-validator.ts # Validasi caption/media per platform
│   │   └── errors.ts            # Custom error classes
│   │
│   └── db/
│       ├── schema/              # Drizzle ORM schema definitions
│       │   ├── organizations.ts
│       │   ├── users.ts
│       │   ├── clients.ts
│       │   └── ... (semua tabel)
│       └── migrations/          # SQL migration files
│
├── tests/
│   ├── setup.ts
│   ├── fixtures/
│   └── integration/
│
├── docker-compose.yml            # Local dev (Postgres + Redis)
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 3. Technology Stack Detail

### Core Framework

**Fastify v4** dipilih karena:
- 3× lebih cepat dari Express di benchmark
- Built-in JSON schema validation (Ajv) — tidak perlu library tambahan
- Native async/await support
- Plugin sistem yang solid (lifecycle hooks)

```typescript
// app.ts
import Fastify from 'fastify'
import { fastifyJWT } from '@fastify/jwt'
import { fastifyMultipart } from '@fastify/multipart'
import { fastifyCors } from '@fastify/cors'
import { fastifyRateLimit } from '@fastify/rate-limit'

const app = Fastify({ logger: true, trustProxy: true })

// Plugins
app.register(fastifyCors, { origin: process.env.FRONTEND_URL })
app.register(fastifyJWT, { secret: process.env.JWT_SECRET! })
app.register(fastifyMultipart, { limits: { fileSize: 20 * 1024 * 1024 } })
app.register(fastifyRateLimit, {
  max: 300,
  timeWindow: '1 minute',
  keyGenerator: (req) => req.user?.org_id || req.ip
})
```

### Database ORM

**Drizzle ORM** untuk type-safe queries dengan Supabase:

```typescript
// db/schema/clients.ts
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  industry: text('industry').notNull(),
  color: text('color').notNull().default('#1a6cff'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
```

---

## 4. Service Layer Design

### Brand Context Builder

Core fungsi yang menjadi fondasi semua AI call:

```typescript
// lib/brand-context.ts

interface BrandContext {
  systemPrompt: string
  clientName: string
  hasGuidelines: boolean
}

export async function buildBrandContext(
  clientId: string,
  db: Database
): Promise<BrandContext> {
  const [client, guidelines, objectives] = await Promise.all([
    db.query.clients.findFirst({ where: eq(clients.id, clientId) }),
    db.query.clientBrandGuidelines.findFirst({
      where: eq(clientBrandGuidelines.clientId, clientId)
    }),
    db.query.clientObjectives.findFirst({
      where: eq(clientObjectives.clientId, clientId)
    })
  ])

  if (!client) throw new NotFoundError('Client not found')

  if (!guidelines) {
    return {
      systemPrompt: 'You are a professional social media content creator.',
      clientName: client.name,
      hasGuidelines: false
    }
  }

  const blacklistStr = guidelines.blacklistWords.length > 0
    ? `\nNEVER use these words: ${guidelines.blacklistWords.join(', ')}.`
    : ''

  const systemPrompt = `
You are a professional social media content creator for ${client.name},
a brand in the ${client.industry} industry.

Brand tone & voice: ${guidelines.tone || 'professional and engaging'}.
Primary language: ${guidelines.language === 'id' ? 'Bahasa Indonesia' : guidelines.language}.
Main marketing objective: ${objectives?.objectiveType?.replace('_', ' ') || 'brand awareness'}.
Target audience: ${objectives?.audienceAgeRange || 'general'}, 
  interests: ${objectives?.audienceInterests?.join(', ') || 'general'}.
${blacklistStr}

Always maintain brand consistency and write content that resonates with the target audience.
  `.trim()

  return { systemPrompt, clientName: client.name, hasGuidelines: true }
}
```

### Platform Validator

```typescript
// lib/platform-validator.ts

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

const PLATFORM_LIMITS = {
  twitter: { caption: 280 },
  threads: { caption: 500 },
  instagram: { caption: 2200 },
  tiktok: { caption: 2200 },
  facebook: { caption: 63206 },
  youtube: { caption: 5000 },
  linkedin: { caption: 3000 }
} as const

export function validatePostForPlatform(
  caption: string,
  platform: string,
  mediaType?: 'image' | 'video'
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const limit = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS]

  if (limit && caption.length > limit.caption) {
    errors.push(`Caption terlalu panjang untuk ${platform}: ${caption.length}/${limit.caption} karakter`)
  }

  if (platform === 'twitter' && caption.length > 240) {
    warnings.push('Caption panjang — pertimbangkan thread')
  }

  return { valid: errors.length === 0, errors, warnings }
}
```

---

## 5. Background Jobs (BullMQ)

### Queue Setup

```typescript
// jobs/queues.ts
import { Queue } from 'bullmq'
import { redis } from '../config/redis'

export const publishQueue = new Queue('publish-post', { connection: redis })
export const tokenRefreshQueue = new Queue('token-refresh', { connection: redis })
export const analyticsQueue = new Queue('fetch-analytics', { connection: redis })
export const mediaQueue = new Queue('process-media', { connection: redis })
export const videoPollQueue = new Queue('video-poll', { connection: redis })
export const notificationQueue = new Queue('send-notification', { connection: redis })
```

### Publish Worker

```typescript
// jobs/workers/publish.worker.ts
import { Worker, Job } from 'bullmq'
import { getPlatformClient } from '../../integrations/platforms'

interface PublishJobData {
  postId: string
  platform: string
  socialAccountId: string
  caption: string
  hashtags: string[]
  mediaUrl?: string
  postType: string
}

const publishWorker = new Worker<PublishJobData>(
  'publish-post',
  async (job: Job<PublishJobData>) => {
    const { postId, platform, socialAccountId, caption, hashtags, mediaUrl } = job.data

    // 1. Get decrypted token
    const account = await getSocialAccountWithToken(socialAccountId)

    // 2. Get platform client
    const client = getPlatformClient(platform, account.accessToken)

    // 3. Publish
    const result = await client.publish({
      caption: `${caption}\n\n${hashtags.join(' ')}`,
      mediaUrl,
      postType: job.data.postType
    })

    // 4. Update post_platforms status
    await updatePostPlatformStatus(postId, platform, {
      status: 'published',
      externalId: result.id,
      externalUrl: result.url,
      publishedAt: new Date()
    })

    // 5. Queue notification
    await notificationQueue.add('post-published', {
      postId,
      platform,
      externalUrl: result.url
    })

    return result
  },
  {
    connection: redis,
    concurrency: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000  // 1 menit base, lalu 5 menit, 15 menit
    }
  }
)

publishWorker.on('failed', async (job, err) => {
  if (job && job.attemptsMade >= 3) {
    await updatePostPlatformStatus(job.data.postId, job.data.platform, {
      status: 'failed',
      errorCode: err.code || 'UNKNOWN_ERROR',
      errorMessage: err.message
    })
    await notificationQueue.add('post-failed', { postId: job.data.postId, platform: job.data.platform, error: err.message })
  }
})
```

### Token Refresh Worker

```typescript
// jobs/workers/token-refresh.worker.ts
// Cron: setiap 6 jam

const tokenRefreshWorker = new Worker('token-refresh', async (job) => {
  const { accountId } = job.data

  const account = await getSocialAccountWithToken(accountId)
  const client = getPlatformClient(account.platform, account.refreshToken)

  const newTokens = await client.refreshToken()

  await updateSocialAccountTokens(accountId, {
    accessTokenEnc: encrypt(newTokens.accessToken),
    refreshTokenEnc: newTokens.refreshToken ? encrypt(newTokens.refreshToken) : undefined,
    tokenExpiresAt: newTokens.expiresAt,
    status: 'connected'
  })
})

// Scheduler: cron setiap 6 jam untuk cek token yang akan expired
export async function scheduleTokenRefreshes() {
  const expiringAccounts = await db.query.socialAccounts.findMany({
    where: and(
      eq(socialAccounts.status, 'connected'),
      lt(socialAccounts.tokenExpiresAt, new Date(Date.now() + 48 * 60 * 60 * 1000))
    )
  })

  for (const account of expiringAccounts) {
    await tokenRefreshQueue.add(`refresh-${account.id}`, { accountId: account.id })
  }
}
```

### Cron Jobs

```typescript
// jobs/schedulers/cron.ts
import cron from 'node-cron'

// Setiap 1 menit: process scheduled posts yang sudah waktunya
cron.schedule('* * * * *', async () => {
  const duePosts = await getDueScheduledPosts()
  for (const post of duePosts) {
    for (const platform of post.platforms) {
      await publishQueue.add(`publish-${post.id}-${platform}`, {
        postId: post.id,
        platform: platform.platform,
        socialAccountId: platform.socialAccountId,
        caption: post.caption,
        hashtags: post.hashtags,
        mediaUrl: post.imageUrl || post.videoUrl,
        postType: post.postType
      })
    }
    await updatePostStatus(post.id, 'publishing')
  }
})

// Setiap 6 jam: token refresh check
cron.schedule('0 */6 * * *', scheduleTokenRefreshes)

// Setiap 24 jam (jam 3 pagi): sync analytics dari semua platform
cron.schedule('0 3 * * *', syncAllAnalytics)

// Setiap 30 detik: poll video generation jobs yang pending
cron.schedule('*/30 * * * * *', pollVideoPendingJobs)
```

---

## 6. Security Implementation

### Token Encryption

```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')  // 32 bytes = 64 hex chars

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
  ciphertext += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Format: iv:authTag:ciphertext (semua hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, ciphertext] = encryptedData.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)

  let plaintext = decipher.update(ciphertext, 'hex', 'utf8')
  plaintext += decipher.final('utf8')

  return plaintext
}
```

### Auth Middleware

```typescript
// middleware/auth.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify'

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await req.jwtVerify<{ sub: string; org_id: string; role: string }>()

    // Set RLS context di Supabase untuk query berikutnya
    await req.db.execute(
      sql`SELECT set_config('app.current_user_id', ${payload.sub}, true),
               set_config('app.current_org_id', ${payload.org_id}, true)`
    )

    req.user = {
      id: payload.sub,
      orgId: payload.org_id,
      role: payload.role as UserRole
    }
  } catch (err) {
    reply.code(401).send({ error: { code: 'INVALID_TOKEN', message: 'Token tidak valid atau sudah expired' } })
  }
}

// Role check helper
export function requireRole(...roles: UserRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(req.user.role)) {
      reply.code(403).send({
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Anda tidak memiliki akses untuk aksi ini' }
      })
    }
  }
}
```

---

## 7. Platform API Integration

### Abstract Publisher Interface

```typescript
// integrations/platforms/base.ts
export interface PlatformPublisher {
  publish(params: PublishParams): Promise<PublishResult>
  refreshToken(): Promise<NewTokens>
  getStats(params: StatsParams): Promise<PlatformStats>
}

export interface PublishParams {
  caption: string
  mediaUrl?: string
  postType: 'feed' | 'story' | 'reel' | 'short' | 'thread' | 'video'
  extraParams?: Record<string, unknown>
}

export interface PublishResult {
  id: string
  url: string
  publishedAt: Date
}
```

### Instagram Publisher

```typescript
// integrations/platforms/instagram.ts
export class InstagramPublisher implements PlatformPublisher {
  private baseUrl = 'https://graph.instagram.com/v19.0'

  constructor(
    private accessToken: string,
    private igUserId: string
  ) {}

  async publish(params: PublishParams): Promise<PublishResult> {
    // Step 1: Create media container
    const containerRes = await fetch(`${this.baseUrl}/${this.igUserId}/media`, {
      method: 'POST',
      body: JSON.stringify({
        image_url: params.mediaUrl,
        caption: params.caption,
        access_token: this.accessToken
      })
    })

    const { id: containerId } = await containerRes.json()

    // Step 2: Publish container
    const publishRes = await fetch(`${this.baseUrl}/${this.igUserId}/media_publish`, {
      method: 'POST',
      body: JSON.stringify({
        creation_id: containerId,
        access_token: this.accessToken
      })
    })

    const { id: postId } = await publishRes.json()

    return {
      id: postId,
      url: `https://www.instagram.com/p/${postId}/`,
      publishedAt: new Date()
    }
  }
}
```

---

## 8. AI Integration Layer

### Anthropic Streaming

```typescript
// integrations/ai/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function* streamCaption(params: {
  systemPrompt: string
  userPrompt: string
  model?: string
}): AsyncGenerator<string> {
  const stream = client.messages.stream({
    model: params.model || 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: params.systemPrompt,
    messages: [{ role: 'user', content: params.userPrompt }]
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}

// Fastify SSE handler
export async function captionSSEHandler(req: FastifyRequest, reply: FastifyReply) {
  const { clientId, topic, platform, language, hashtagCount } = req.body as CaptionRequest

  // Build brand context
  const { systemPrompt } = await buildBrandContext(clientId, req.db)

  const userPrompt = buildCaptionPrompt({ topic, platform, language, hashtagCount })

  // Set SSE headers
  reply.raw.setHeader('Content-Type', 'text/event-stream')
  reply.raw.setHeader('Cache-Control', 'no-cache')
  reply.raw.setHeader('Connection', 'keep-alive')

  let captionTokens = 0
  let fullText = ''

  for await (const chunk of streamCaption({ systemPrompt, userPrompt })) {
    fullText += chunk
    captionTokens++

    // Detect jika chunk adalah bagian hashtag
    const type = fullText.includes('HASHTAG:') && chunk.includes('#') ? 'hashtag' : 'caption'

    reply.raw.write(`event: chunk\ndata: ${JSON.stringify({ type, text: chunk })}\n\n`)
  }

  // Log usage
  await logUsage({ orgId: req.user.orgId, clientId, action: 'caption_generate', tokensOutput: captionTokens })

  reply.raw.write(`event: done\ndata: ${JSON.stringify({ tokens_used: captionTokens })}\n\n`)
  reply.raw.end()
}
```

---

## 9. Storage & CDN

### Supabase Storage Structure

```
bucket: sociostudio-media (private, dengan signed URLs)
  ├── {org_id}/
  │     └── {client_id}/
  │           ├── uploads/
  │           │     └── {media_id}.webp
  │           ├── generated/
  │           │     └── {media_id}.webp
  │           ├── exports/
  │           │     └── {media_id}.webp
  │           ├── videos/
  │           │     └── {media_id}.mp4
  │           └── thumbnails/
  │                 └── {media_id}_thumb.webp
  └── ...
```

### Upload Flow

```typescript
// integrations/storage/supabase-storage.ts
export async function uploadMedia(params: {
  orgId: string
  clientId: string
  file: MultipartFile
  mediaId: string
}): Promise<string> {
  const { orgId, clientId, file, mediaId } = params
  const ext = getExtension(file.mimetype)
  const storagePath = `${orgId}/${clientId}/uploads/${mediaId}.${ext}`

  const { error } = await supabase.storage
    .from('sociostudio-media')
    .upload(storagePath, file.file, {
      contentType: file.mimetype,
      upsert: false
    })

  if (error) throw new StorageError(error.message)

  // Get public CDN URL
  const { data } = supabase.storage
    .from('sociostudio-media')
    .getPublicUrl(storagePath)

  return data.publicUrl
}
```

---

## 10. Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://app.sociostudio.id

# Auth
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-chars
ENCRYPTION_KEY=64-char-hex-string-for-aes256  # generate: openssl rand -hex 32

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...

# Redis (Upstash)
REDIS_URL=rediss://:[password]@[host]:6379

# AI Providers
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...             # fallback
STABILITY_API_KEY=sk-...
RUNWAY_API_KEY=key_...
REPLICATE_API_TOKEN=r8_...

# Storage
SUPABASE_STORAGE_BUCKET=sociostudio-media

# Platform OAuth
IG_APP_ID=your-instagram-app-id
IG_APP_SECRET=your-instagram-app-secret
IG_REDIRECT_URI=https://api.sociostudio.id/v1/oauth/instagram/callback

TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

FB_APP_ID=your-facebook-app-id
FB_APP_SECRET=your-facebook-app-secret

TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@sociostudio.id

# Billing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MIDTRANS_SERVER_KEY=Mid-server-...
MIDTRANS_CLIENT_KEY=Mid-client-...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
POSTHOG_API_KEY=phc_...
```

---

## 11. Deployment

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Railway / Fly.io Config

```toml
# fly.toml
app = "sociostudio-api"
primary_region = "sin"  # Singapore — dekat Indonesia

[[services]]
  internal_port = 3000
  protocol = "tcp"
  [[services.ports]]
    handlers = ["http"]
    port = 80
  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

[deploy]
  strategy = "rolling"

[[vm]]
  cpu_kind = "shared"
  cpus = 2
  memory_mb = 1024
```

### Database Migrations

```bash
# Generate migration dari schema changes
npx drizzle-kit generate:pg

# Apply migrations
npx drizzle-kit push:pg

# Production: apply via CI/CD
npx drizzle-kit migrate
```

---

## 12. Monitoring & Alerting

### Sentry Integration

```typescript
// server.ts
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Postgres(),
  ]
})

// Fastify error handler
app.setErrorHandler((error, req, reply) => {
  Sentry.captureException(error, {
    user: { id: req.user?.id, org_id: req.user?.orgId },
    extra: { url: req.url, method: req.method }
  })

  if (error.statusCode) {
    reply.status(error.statusCode).send({ error: { code: error.code, message: error.message } })
  } else {
    reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan internal' } })
  }
})
```

### Key Alerts to Set Up

| Alert | Trigger | Channel |
|---|---|---|
| Publish failure rate > 5% | Dalam 1 jam | Slack + Email |
| Token refresh failure | Any failure | Slack |
| API error rate > 1% | Dalam 5 menit | PagerDuty |
| DB connection pool exhausted | > 90% usage | Slack |
| Redis memory > 80% | Any | Slack |
| AI cost per hour > $10 | Any | Email |
| Storage quota > 80% per org | Any | Email ke org |
| Scheduled post missed (> 5 menit telat) | Any | Slack |
