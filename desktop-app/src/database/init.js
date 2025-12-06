/**
 * Database Initialization
 * Creates tables and sets up schema
 */

const db = require('./index');

async function initializeDatabase() {
  console.log('[Database] Initializing database...');

  try {
    // Create devices table
    await db.run(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        device_name TEXT NOT NULL,
        browser TEXT,
        os TEXT,
        created_at TEXT NOT NULL,
        last_heartbeat TEXT
      )
    `);

    // Create watch_history table
    await db.run(`
      CREATE TABLE IF NOT EXISTS watch_history (
        id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        video_title TEXT,
        channel_name TEXT,
        thumbnail_url TEXT,
        video_url TEXT NOT NULL,
        watched_at TEXT NOT NULL,
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
      )
    `);

    // Create blocks table
    await db.run(`
      CREATE TABLE IF NOT EXISTS blocks (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('video', 'channel')),
        youtube_id TEXT NOT NULL,
        title TEXT,
        channel_name TEXT,
        thumbnail_url TEXT,
        custom_message TEXT,
        device_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
      )
    `);

    // Create block_attempts table (Phase 3)
    await db.run(`
      CREATE TABLE IF NOT EXISTS block_attempts (
        id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        youtube_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('video', 'channel')),
        video_title TEXT,
        channel_name TEXT,
        attempted_at TEXT NOT NULL,
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
      )
    `);

    // Create time_rules table (for Phase 4)
    await db.run(`
      CREATE TABLE IF NOT EXISTS time_rules (
        id TEXT PRIMARY KEY,
        device_id TEXT,
        rule_type TEXT NOT NULL CHECK(rule_type IN ('time_block', 'daily_limit')),
        days TEXT,
        start_time TEXT,
        end_time TEXT,
        daily_minutes INTEGER,
        enabled INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
      )
    `);

    // Create settings table
    await db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create indexes
    await db.run('CREATE INDEX IF NOT EXISTS idx_watch_history_device ON watch_history(device_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_watch_history_watched ON watch_history(watched_at)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_blocks_youtube ON blocks(youtube_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_blocks_device ON blocks(device_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_block_attempts_device ON block_attempts(device_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_block_attempts_date ON block_attempts(attempted_at)');

    console.log('[Database] Database initialized successfully');
    return true;
  } catch (error) {
    console.error('[Database] Error initializing database:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };
