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
  try {
    console.log('Starting initialization...');
    
    // Get database path
    const appPath = await ipcRenderer.invoke('get-app-path');
    dbPath = path.join(appPath, 'youtube-monitor.db');
    console.log('Database path:', dbPath);
    
    // Initialize SQL.js with explicit wasm path
    console.log('Initializing SQL.js...');
    const wasmPath = path.join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm');
    console.log('WASM path:', wasmPath);
    
    const SQL = await initSqlJs({
      locateFile: file => {
        // Return the path to the wasm file
        const wasmFilePath = path.join(__dirname, '../../node_modules/sql.js/dist', file);
        console.log('Loading WASM file from:', wasmFilePath);
        return wasmFilePath;
      }
    });
    console.log('SQL.js initialized');
    
    // Load database
    if (fs.existsSync(dbPath)) {
      console.log('Loading existing database...');
      const data = fs.readFileSync(dbPath);
      db = new SQL.Database(data);
      console.log('Database loaded');
    } else {
      console.log('Creating new database...');
      db = new SQL.Database();
      console.log('Database created');
    }

    // Check if password is set
    console.log('Checking password status...');
    const password = getOne('SELECT value FROM settings WHERE key = ?', ['admin_password']);
    isPasswordSet = !!password;
    console.log('Password set:', isPasswordSet);

    if (!isPasswordSet) {
      console.log('Showing password setup modal...');
      showPasswordSetup();
    } else {
      console.log('Loading theme and dashboard...');
      loadTheme();
      loadPage('dashboard');
      setupNavigation();
      console.log('Initialization complete');
    }
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Failed to initialize app: ' + error.message);
  }
}

function saveDatabase() {
  try {
    if (db) {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    }
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

function execQuery(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
  } catch (error) {
    console.error('Error executing query:', error);
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
    console.error('Error in getOne:', error);
    return null;
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
    console.error('Error in getAll:', error);
    return [];
  }
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
  console.log('Password setup modal shown');
}

window.savePassword = async function() {
  try {
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

    console.log('Hashing password...');
    const hash = await bcrypt.hash(password, 10);
    console.log('Password hashed, saving to database...');
    execQuery('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['admin_password', hash]);
    
    isPasswordSet = true;
    document.querySelector('.modal').remove();
    console.log('Password saved, loading dashboard...');
    loadTheme();
    loadPage('dashboard');
    setupNavigation();
  } catch (error) {
    console.error('Error saving password:', error);
    alert('Failed to save password: ' + error.message);
  }
};

// Setup navigation
function setupNavigation() {
  try {
    console.log('Setting up navigation...');
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Found', navLinks.length, 'navigation links');
    
    navLinks.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        console.log('Navigation clicked:', page);
        loadPage(page);
        
        // Update active state
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
      console.log(`Navigation ${index + 1} setup complete`);
    });
    console.log('Navigation setup complete');
  } catch (error) {
    console.error('Error setting up navigation:', error);
  }
}

// Load page
function loadPage(page) {
  try {
    console.log('Loading page:', page);
    currentPage = page;
    const content = document.getElementById('main-content');
    
    if (!content) {
      console.error('main-content element not found!');
      return;
    }
    
    let html = '';
    switch(page) {
      case 'dashboard':
        html = getDashboardPage();
        break;
      case 'watch-history':
        html = getWatchHistoryPage();
        break;
      case 'blocks':
        html = getBlocksPage();
        break;
      case 'devices':
        html = getDevicesPage();
        break;
      case 'settings':
        html = getSettingsPage();
        content.innerHTML = html;
        setupSettingsHandlers();
        console.log('Page loaded:', page);
        return;
    }
    
    content.innerHTML = html;
    console.log('Page loaded:', page);
  } catch (error) {
    console.error('Error loading page:', error);
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = `
        <div class="page">
          <div class="empty-state">
            <h3>Error Loading Page</h3>
            <p>${error.message}</p>
          </div>
        </div>
      `;
    }
  }
}

// Dashboard page
function getDashboardPage() {
  try {
    console.log('Generating dashboard page...');
    const devices = getAll('SELECT * FROM devices', []);
    const totalVideos = getOne('SELECT COUNT(*) as count FROM watch_history', [])?.count || 0;
    const totalBlocks = getOne('SELECT COUNT(*) as count FROM blocks', [])?.count || 0;
    console.log('Dashboard data:', { devices: devices.length, videos: totalVideos, blocks: totalBlocks });

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
  } catch (error) {
    console.error('Error generating dashboard:', error);
    return `
      <div class="page">
        <div class="empty-state">
          <h3>Error</h3>
          <p>${error.message}</p>
        </div>
      </div>
    `;
  }
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
  try {
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
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Failed to change password: ' + error.message);
  }
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
console.log('app.js loaded, starting initialization...');
init().catch(error => {
  console.error('Fatal initialization error:', error);
  alert('Failed to start application: ' + error.message);
});
