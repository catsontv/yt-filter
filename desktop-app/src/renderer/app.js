const { ipcRenderer } = require('electron');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

let db;
let currentPage = 'dashboard';
let currentTheme = 'light';
let isPasswordSet = false;
let dbPath;

// Initialize app
async function init() {
  // Get database path
  const appPath = await ipcRenderer.invoke('get-app-path');
  dbPath = path.join(appPath, 'youtube-monitor.db');
  
  // Initialize SQL.js
  const SQL = await initSqlJs();
  
  // Load database
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath);
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
  }

  // Check if password is set
  const password = getOne('SELECT value FROM settings WHERE key = ?', ['admin_password']);
  isPasswordSet = !!password;

  if (!isPasswordSet) {
    showPasswordSetup();
  } else {
    loadTheme();
    loadPage('dashboard');
    setupNavigation();
  }
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function execQuery(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
}

function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Password setup modal
function showPasswordSetup() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Welcome to YouTube Monitor</h2>
        <p style="color: var(--text-secondary); margin-top: 10px;">Set up your admin password to get started</p>
      </div>
      <div class="form-group">
        <label>Admin Password</label>
        <input type="password" id="setup-password" placeholder="Enter password">
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <input type="password" id="setup-password-confirm" placeholder="Confirm password">
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="savePassword()">Set Password</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

window.savePassword = async function() {
  const password = document.getElementById('setup-password').value;
  const confirm = document.getElementById('setup-password-confirm').value;

  if (!password || password.length < 4) {
    alert('Password must be at least 4 characters');
    return;
  }

  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  execQuery('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['admin_password', hash]);
  
  isPasswordSet = true;
  document.querySelector('.modal').remove();
  loadTheme();
  loadPage('dashboard');
  setupNavigation();
};

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      loadPage(page);
      
      // Update active state
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// Load page
function loadPage(page) {
  currentPage = page;
  const content = document.getElementById('main-content');
  
  switch(page) {
    case 'dashboard':
      content.innerHTML = getDashboardPage();
      break;
    case 'watch-history':
      content.innerHTML = getWatchHistoryPage();
      break;
    case 'blocks':
      content.innerHTML = getBlocksPage();
      break;
    case 'devices':
      content.innerHTML = getDevicesPage();
      break;
    case 'settings':
      content.innerHTML = getSettingsPage();
      setupSettingsHandlers();
      break;
  }
}

// Dashboard page
function getDashboardPage() {
  const devices = getAll('SELECT * FROM devices', []);
  const totalVideos = getOne('SELECT COUNT(*) as count FROM watch_history', [])?.count || 0;
  const totalBlocks = getOne('SELECT COUNT(*) as count FROM blocks', [])?.count || 0;

  if (devices.length === 0) {
    return `
      <div class="page">
        <div class="page-header">
          <h1>Dashboard</h1>
          <p>Overview of your YouTube monitoring</p>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <h3>No devices yet</h3>
          <p>Install the Chrome extension on your child's device to get started</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your YouTube monitoring</p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div class="card">
          <h3>📱 Devices</h3>
          <div style="font-size: 32px; font-weight: 600; margin-top: 10px;">${devices.length}</div>
          <p style="color: var(--text-secondary); margin-top: 5px;">Registered devices</p>
        </div>
        
        <div class="card">
          <h3>🎬 Watch History</h3>
          <div style="font-size: 32px; font-weight: 600; margin-top: 10px;">${totalVideos}</div>
          <p style="color: var(--text-secondary); margin-top: 5px;">Videos tracked</p>
        </div>
        
        <div class="card">
          <h3>🚫 Blocks</h3>
          <div style="font-size: 32px; font-weight: 600; margin-top: 10px;">${totalBlocks}</div>
          <p style="color: var(--text-secondary); margin-top: 5px;">Active blocks</p>
        </div>
      </div>

      <div class="card">
        <h3>Active Devices</h3>
        <table>
          <thead>
            <tr>
              <th>Device Name</th>
              <th>Status</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            ${devices.map(device => `
              <tr>
                <td>${device.name}</td>
                <td>
                  <span class="status-badge ${device.is_online ? 'status-online' : 'status-offline'}">
                    ${device.is_online ? '● Online' : '○ Offline'}
                  </span>
                </td>
                <td>${device.last_heartbeat ? new Date(device.last_heartbeat).toLocaleString() : 'Never'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Watch History page
function getWatchHistoryPage() {
  const history = getAll(`
    SELECT wh.*, d.name as device_name
    FROM watch_history wh
    LEFT JOIN devices d ON wh.device_id = d.id
    ORDER BY wh.watched_at DESC
    LIMIT 50
  `, []);

  return `
    <div class="page">
      <div class="page-header">
        <h1>Watch History</h1>
        <p>Videos watched across all devices</p>
      </div>
      
      ${history.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🎬</div>
          <h3>No watch history yet</h3>
          <p>Watch history will appear here once devices start tracking</p>
        </div>
      ` : `
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Video</th>
                <th>Channel</th>
                <th>Device</th>
                <th>Watched At</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(item => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      ${item.thumbnail_url ? `<img src="${item.thumbnail_url}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 4px;">` : ''}
                      <div>
                        <strong>${item.title || 'Unknown Title'}</strong>
                        ${item.video_url ? `<br><a href="${item.video_url}" target="_blank" style="color: var(--accent-color); font-size: 12px;">Watch on YouTube</a>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>${item.channel_name || 'Unknown'}</td>
                  <td>${item.device_name || 'Unknown Device'}</td>
                  <td>${new Date(item.watched_at).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// Blocks page
function getBlocksPage() {
  const blocks = getAll('SELECT * FROM blocks ORDER BY created_at DESC', []);

  return `
    <div class="page">
      <div class="page-header">
        <h1>Blocks</h1>
        <p>Manage blocked videos, channels, and keywords</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <button class="btn" disabled>➕ Add Block</button>
        <span style="color: var(--text-secondary); margin-left: 10px; font-size: 14px;">(Available in Phase 3)</span>
      </div>

      ${blocks.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🚫</div>
          <h3>No blocks yet</h3>
          <p>Add blocks to restrict specific videos, channels, or keywords</p>
        </div>
      ` : `
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Value</th>
                <th>Title</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${blocks.map(block => `
                <tr>
                  <td><span class="status-badge">${block.type}</span></td>
                  <td>${block.value}</td>
                  <td>${block.title || '-'}</td>
                  <td>${new Date(block.created_at).toLocaleDateString()}</td>
                  <td><button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">Delete</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// Devices page
function getDevicesPage() {
  const devices = getAll('SELECT * FROM devices ORDER BY created_at DESC', []);

  return `
    <div class="page">
      <div class="page-header">
        <h1>Devices</h1>
        <p>Manage registered devices</p>
      </div>
      
      ${devices.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📱</div>
          <h3>No devices registered</h3>
          <p>Install the Chrome extension to register a device</p>
        </div>
      ` : `
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Device ID</th>
                <th>Status</th>
                <th>Last Heartbeat</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              ${devices.map(device => `
                <tr>
                  <td><strong>${device.name}</strong></td>
                  <td><code style="font-size: 11px;">${device.id}</code></td>
                  <td>
                    <span class="status-badge ${device.is_online ? 'status-online' : 'status-offline'}">
                      ${device.is_online ? '● Online' : '○ Offline'}
                    </span>
                  </td>
                  <td>${device.last_heartbeat ? new Date(device.last_heartbeat).toLocaleString() : 'Never'}</td>
                  <td>${new Date(device.created_at).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// Settings page
function getSettingsPage() {
  const apiUrl = 'http://localhost:3000';
  const theme = getOne('SELECT value FROM settings WHERE key = ?', ['theme']);
  currentTheme = theme ? theme.value : 'light';

  return `
    <div class="page">
      <div class="page-header">
        <h1>Settings</h1>
        <p>Configure your YouTube Monitor</p>
      </div>
      
      <div class="card">
        <h3>Admin Password</h3>
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" id="current-password" placeholder="Enter current password">
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="new-password" placeholder="Enter new password">
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input type="password" id="confirm-password" placeholder="Confirm new password">
        </div>
        <button class="btn" onclick="changePassword()">Change Password</button>
      </div>

      <div class="card">
        <h3>API Configuration</h3>
        <div class="form-group">
          <label>API URL</label>
          <input type="text" value="${apiUrl}" readonly>
          <p style="color: var(--text-secondary); margin-top: 5px; font-size: 13px;">This URL is used by the Chrome extension to connect</p>
        </div>
      </div>

      <div class="card">
        <h3>Appearance</h3>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong>Theme</strong>
            <p style="color: var(--text-secondary); margin-top: 5px; font-size: 13px;">Switch between light and dark mode</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="theme-toggle" ${currentTheme === 'dark' ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="card">
        <h3>About</h3>
        <p><strong>Version:</strong> 1.0.0</p>
        <p style="margin-top: 10px;"><strong>Status:</strong> Phase 1 - Core Desktop App</p>
        <p style="margin-top: 10px; color: var(--text-secondary); font-size: 13px;">YouTube Monitor - Desktop Application for Parents</p>
      </div>
    </div>
  `;
}

// Setup settings handlers
function setupSettingsHandlers() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      execQuery('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['theme', theme]);
      applyTheme(theme);
    });
  }
}

window.changePassword = async function() {
  const current = document.getElementById('current-password').value;
  const newPass = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;

  if (!current || !newPass || !confirm) {
    alert('Please fill in all fields');
    return;
  }

  if (newPass !== confirm) {
    alert('New passwords do not match');
    return;
  }

  if (newPass.length < 4) {
    alert('Password must be at least 4 characters');
    return;
  }

  const storedHash = getOne('SELECT value FROM settings WHERE key = ?', ['admin_password']).value;
  const valid = await bcrypt.compare(current, storedHash);

  if (!valid) {
    alert('Current password is incorrect');
    return;
  }

  const newHash = await bcrypt.hash(newPass, 10);
  execQuery('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['admin_password', newHash]);
  
  alert('Password changed successfully');
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
};

// Theme functions
function loadTheme() {
  const theme = getOne('SELECT value FROM settings WHERE key = ?', ['theme']);
  if (theme) {
    applyTheme(theme.value);
  }
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  currentTheme = theme;
}

// Initialize on load
init();
