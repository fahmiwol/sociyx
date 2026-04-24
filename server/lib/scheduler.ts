/**
 * OPIX Auto-Post Scheduler
 * Runs every 60s — checks posts with status='scheduled' and scheduled_at <= NOW()
 * Marks them 'published' and logs the action
 */

import { getDb } from "../db/schema";

let _running = false;

export function startScheduler() {
  console.log("[Scheduler] Auto-post scheduler started (interval: 60s)");

  // Run immediately on start, then every 60s
  runSchedulerTick();
  setInterval(runSchedulerTick, 60_000);
}

async function runSchedulerTick() {
  if (_running) return;
  _running = true;
  try {
    await processDuePosts();
  } catch (err: any) {
    console.error("[Scheduler] Error:", err.message);
  } finally {
    _running = false;
  }
}

function processDuePosts() {
  const db = getDb();
  const now = new Date().toISOString();

  // Find all posts due for publishing
  const duePosts = db.prepare(`
    SELECT p.id, p.title, p.caption, p.platforms, p.org_id, p.client_id,
           c.name as client_name
    FROM posts p
    JOIN clients c ON c.id = p.client_id
    WHERE p.status = 'scheduled'
      AND p.scheduled_at IS NOT NULL
      AND p.scheduled_at <= ?
  `).all(now) as any[];

  if (duePosts.length === 0) return;

  console.log(`[Scheduler] Processing ${duePosts.length} due post(s)...`);

  const publish = db.prepare(`
    UPDATE posts
    SET status = 'published',
        published_at = datetime('now'),
        updated_at = datetime('now')
    WHERE id = ?
  `);

  const logEntry = db.prepare(`
    INSERT INTO scheduler_log (post_id, org_id, client_id, action, detail, created_at)
    VALUES (?, ?, ?, 'publish', ?, datetime('now'))
  `);

  // Run in a transaction
  const txn = db.transaction((posts: any[]) => {
    for (const post of posts) {
      publish.run(post.id);

      // Log it (ignore error if table doesn't exist yet)
      try {
        logEntry.run(
          post.id,
          post.org_id,
          post.client_id,
          JSON.stringify({
            title: post.title || post.caption?.slice(0, 50),
            platforms: post.platforms,
            client: post.client_name,
          })
        );
      } catch { /* table may not exist on first run */ }

      console.log(`[Scheduler] ✅ Published: post #${post.id} — "${post.title || "(no title)"}" for ${post.client_name}`);
    }
  });

  txn(duePosts);
  return duePosts.length;
}
