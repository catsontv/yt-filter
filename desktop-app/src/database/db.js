const initSqlJs = require('sql.js');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db;
let SQL;

function getDbPath() {
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  return path.join(userDataPath, 'youtube-monitor.db');
}

async function initDatabase() {
  const dbPath = getDbPath();
  console.log('Database path:', dbPath);
  
  // Initialize SQL.js with explicit wasm path for Electron
  SQL = await initSqlJs({
    locateFile: file => {
      // In Electron, we need to provide the path relative to the app
      const wasmPath = path.join(__dirname, '../../node_modules/sql.js/dist', file);
      console.log('Loading WASM from:', wasmPath);
      return wasmPath;
    }
  });
  
  // Load existing database or create new one
  let data;
  if (fs.existsSync(dbPath)) {
    data = fs.readFileSync(dbPath);
    db = new SQL.Database(data);
    console.log('Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('Created new database');
  }

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

  db.run(schema);
  
  // Save database to file
  saveDatabase();
  
  console.log('Database initialized successfully');
  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(getDbPath(), buffer);
  }
}

function getDatabase() {
  return db;
}

function execQuery(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

function getOne(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

function getAll(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  saveDatabase,
  execQuery,
  getOne,
  getAll
};
