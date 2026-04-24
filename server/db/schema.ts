import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "opix.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    runMigrations(_db);
  }
  return _db;
}

function runMigrations(db: Database.Database) {
  db.exec(`
    -- Organizations (tenants)
    CREATE TABLE IF NOT EXISTS organizations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      slug       TEXT NOT NULL UNIQUE,
      logo_url   TEXT,
      plan       TEXT NOT NULL DEFAULT 'starter',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id        INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name     TEXT NOT NULL,
      avatar_url    TEXT,
      role          TEXT NOT NULL DEFAULT 'member',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Clients (social media clients managed by an org)
    CREATE TABLE IF NOT EXISTS clients (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id     INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      industry   TEXT,
      logo_url   TEXT,
      color      TEXT NOT NULL DEFAULT '#6366f1',
      initials   TEXT,
      is_active  INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Brand guidelines per client
    CREATE TABLE IF NOT EXISTS brand_guidelines (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id          INTEGER NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
      brand_voice        TEXT,
      tone               TEXT,
      key_messages       TEXT,
      visual_guidelines  TEXT,
      hashtags           TEXT,
      target_audience    TEXT,
      updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Social media accounts per client
    CREATE TABLE IF NOT EXISTS social_accounts (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id        INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      platform         TEXT NOT NULL,
      username         TEXT,
      platform_user_id TEXT,
      access_token     TEXT,
      refresh_token    TEXT,
      expires_at       TEXT,
      is_active        INTEGER NOT NULL DEFAULT 1,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Posts
    CREATE TABLE IF NOT EXISTS posts (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id         INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      created_by     INTEGER REFERENCES users(id),
      title          TEXT,
      caption        TEXT NOT NULL DEFAULT '',
      hashtags       TEXT,
      platforms      TEXT NOT NULL DEFAULT '[]',
      status         TEXT NOT NULL DEFAULT 'draft',
      scheduled_at   TEXT,
      published_at   TEXT,
      cover_url      TEXT,
      ai_generated   INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Media assets
    CREATE TABLE IF NOT EXISTS media_assets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id      INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      client_id   INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      filename    TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type   TEXT NOT NULL,
      file_size   INTEGER NOT NULL,
      url         TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(org_id);
    CREATE INDEX IF NOT EXISTS idx_posts_org ON posts(org_id);
    CREATE INDEX IF NOT EXISTS idx_posts_client ON posts(client_id);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_media_org ON media_assets(org_id);
    CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);
  `);
}
