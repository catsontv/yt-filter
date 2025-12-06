/**
 * Database Module
 * Exports all database operations
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db = null;

// Get database path
function getDbPath() {
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  return path.join(userDataPath, 'youtube-monitor.db');
}

// Initialize database connection
function initDb() {
  return new Promise((resolve, reject) => {
    const dbPath = getDbPath();
    console.log('[Database] Opening database at:', dbPath);

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[Database] Error opening database:', err);
        reject(err);
      } else {
        console.log('[Database] Database opened successfully');
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
        resolve(db);
      }
    });
  });
}

// Generic run method
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Generic get method (single row)
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Generic all method (multiple rows)
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

// Close database
function closeDb() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('[Database] Database closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

// Import operation modules
const deviceOps = require('./devices');
const watchHistoryOps = require('./watchHistory');
const blockOps = require('./blocks');

module.exports = {
  initDb,
  closeDb,
  run,
  get,
  all,
  getDbPath,
  // Device operations
  ...deviceOps,
  // Watch history operations
  ...watchHistoryOps,
  // Block operations
  ...blockOps
};
