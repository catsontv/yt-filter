const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db;

function getDbPath() {
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  return path.join(userDataPath, 'youtube-monitor.db');
}

function initDatabase() {
  const dbPath = getDbPath();
  console.log('Database path:', dbPath);
  
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create tables
  const schema = `
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      last_heartbeat INTEGER,
      created_at INTEGER NOT NULL,
      is_online INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS watch_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      title TEXT,
      channel_name TEXT,
      channel_id TEXT,
      thumbnail_url TEXT,
      video_url TEXT,
      watched_at INTEGER NOT NULL,
      duration INTEGER,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    );

    CREATE TABLE IF NOT EXISTS blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('video', 'channel', 'keyword')),
      value TEXT NOT NULL,
      title TEXT,
      custom_message TEXT,
      device_id TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    );

    CREATE TABLE IF NOT EXISTS time_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      rule_type TEXT NOT NULL CHECK(rule_type IN ('schedule', 'daily_limit')),
      days TEXT,
      start_time TEXT,
      end_time TEXT,
      max_minutes INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS block_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      block_id INTEGER NOT NULL,
      video_id TEXT,
      attempted_at INTEGER NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices(id),
      FOREIGN KEY (block_id) REFERENCES blocks(id)
    );

    CREATE INDEX IF NOT EXISTS idx_watch_history_device ON watch_history(device_id);
    CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(watched_at);
    CREATE INDEX IF NOT EXISTS idx_blocks_device ON blocks(device_id);
    CREATE INDEX IF NOT EXISTS idx_block_attempts_device ON block_attempts(device_id);
  `;

  db.exec(schema);
  console.log('Database initialized successfully');
  return db;
}

function getDatabase() {
  return db;
}

module.exports = {
  initDatabase,
  getDatabase
};
