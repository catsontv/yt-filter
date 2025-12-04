const initSqlJs = require('sql.js');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let SQL;
let dbPath;

function getDbPath() {
  if (dbPath) return dbPath;
  
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  dbPath = path.join(userDataPath, 'youtube-monitor.db');
  return dbPath;
}

async function initDatabase() {
  const path = getDbPath();
  console.log('Database path:', path);
  
  // Initialize SQL.js with explicit wasm path for Electron
  SQL = await initSqlJs({
    locateFile: file => {
      // In Electron, we need to provide the path relative to the app
      const wasmPath = require('path').join(__dirname, '../../node_modules/sql.js/dist', file);
      console.log('Loading WASM from:', wasmPath);
      return wasmPath;
    }
  });
  
  // Create database if it doesn't exist
  if (!fs.existsSync(path)) {
    const db = new SQL.Database();
    
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
    
    // Save to disk
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(path, buffer);
    db.close();
    
    console.log('Created new database');
  } else {
    console.log('Database file exists');
  }
  
  console.log('Database initialized successfully');
  return true;
}

// Helper function to load database from disk
function loadDatabase() {
  const path = getDbPath();
  if (!fs.existsSync(path)) {
    throw new Error('Database file does not exist');
  }
  
  const data = fs.readFileSync(path);
  return new SQL.Database(data);
}

// Helper function to save database to disk
function saveDatabaseToDisk(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(getDbPath(), buffer);
}

function getDatabase() {
  // Always load fresh from disk
  return loadDatabase();
}

function saveDatabase() {
  // Deprecated - kept for compatibility
  // Saving now happens in execQuery
}

function execQuery(sql, params = []) {
  let db;
  try {
    // Load database from disk
    db = loadDatabase();
    
    // Execute query
    db.run(sql, params);
    
    // IMMEDIATELY save to disk
    saveDatabaseToDisk(db);
    
    // Close database
    db.close();
    
    console.log('Query executed and saved:', sql.substring(0, 50) + '...');
  } catch (error) {
    console.error('Query error:', error);
    if (db) db.close();
    throw error;
  }
}

function getOne(sql, params = []) {
  let db;
  try {
    // ALWAYS load fresh from disk
    db = loadDatabase();
    
    const stmt = db.prepare(sql);
    stmt.bind(params);
    
    let row = null;
    if (stmt.step()) {
      row = stmt.getAsObject();
    }
    
    stmt.free();
    db.close();
    
    return row;
  } catch (error) {
    console.error('Query error:', error);
    if (db) db.close();
    throw error;
  }
}

function getAll(sql, params = []) {
  let db;
  try {
    // ALWAYS load fresh from disk
    db = loadDatabase();
    
    const stmt = db.prepare(sql);
    stmt.bind(params);
    
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    
    stmt.free();
    db.close();
    
    console.log(`Query returned ${rows.length} rows:`, sql.substring(0, 50) + '...');
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    if (db) db.close();
    return [];
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
