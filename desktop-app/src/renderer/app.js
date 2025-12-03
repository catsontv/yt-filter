const { ipcRenderer } = require('electron');
const bcrypt = require('bcryptjs');

let currentPage = 'dashboard';
let currentTheme = 'light';
let isPasswordSet = false;
let refreshInterval;

const API_URL = 'http://localhost:3000';

// Initialize app
async function init() {
  try {
    console.log('Starting initialization...');
    
    // Check if password is set by querying the API
    const health = await fetch(API_URL).then(r => r.json());
    console.log('API connected:', health.status);
    
    // For now, skip password check and go straight to dashboard
    // Password is managed by the API/database layer
    console.log('Loading theme and dashboard...');
    loadTheme();
    loadPage('dashboard');
    setupNavigation();
    
    // Start auto-refresh every 5 seconds
    refreshInterval = setInterval(() => {
      if (currentPage === 'dashboard' || currentPage === 'watch-history' || currentPage === 'devices') {
        loadPage(currentPage);
      }
    }, 5000);
    
    console.log('Initialization complete');
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Failed to initialize app: ' + error.message + '\n\nMake sure the API server is running.');
  }
}

// API helper functions
async function apiGet(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return response.json();
}

async function apiPost(endpoint, data) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return response.json();
}

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
async function loadPage(page) {
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
        html = await getDashboardPage();
        break;
      case 'watch-history':
        html = await getWatchHistoryPage();
        break;
      case 'blocks':
        html = await getBlocksPage();
        break;
      case 'devices':
        html = await getDevicesPage();
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
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">Make sure the API server is running</p>
          </div>
        </div>
      `;
    }
  }
}

// Dashboard page
async function getDashboardPage() {
  try {
    console.log('Generating dashboard page...');
    
    // Fetch data from internal API using IPC
    const devices = await ipcRenderer.invoke('db-query', 'SELECT * FROM devices');
    const totalVideos = await ipcRenderer.invoke('db-query', 'SELECT COUNT(*) as count FROM watch_history');
    const totalBlocks = await ipcRenderer.invoke('db-query', 'SELECT COUNT(*) as count FROM blocks');
    
    const videoCount = totalVideos[0]?.count || 0;
    const blockCount = totalBlocks[0]?.count || 0;
    
    console.log('Dashboard data:', { devices: devices.length, videos: videoCount, blocks: blockCount });

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
            <p>Run the test script: <code>.\\test-api.ps1</code></p>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">Or install the Chrome extension on your child's device</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="page">
        <div class="page-header">
          <h1>Dashboard</h1>
          <p>Overview of your YouTube monitoring <span style="font-size: 12px; color: var(--text-secondary);">(Auto-refreshes every 5s)</span></p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div class="card">
            <h3>📱 Devices</h3>
            <div style="font-size: 32px; font-weight: 600; margin-top: 10px;">${devices.length}</div>
            <p style="color: var(--text-secondary); margin-top: 5px;">Registered devices</p>
          </div>
          
          <div class="card">
            <h3>🎬 Watch History</h3>
            <div style="font-size: 32px; font-weight: 600; margin-top: 10px;">${videoCount}</div>
            <p style="color: var(--text-secondary); margin-top: 5px;">Videos tracked</p>
          </div>
          
          <div class="card">
            <h3>🚫 Blocks</h3>
            <div style="font-size: 32px; font-weight: 600; margin-top: 10px;">${blockCount}</div>
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
    throw error;
  }
}

// Watch History page
async function getWatchHistoryPage() {
  const history = await ipcRenderer.invoke('db-query', `
    SELECT wh.*, d.name as device_name
    FROM watch_history wh
    LEFT JOIN devices d ON wh.device_id = d.id
    ORDER BY wh.watched_at DESC
    LIMIT 50
  `);

  return `
    <div class="page">
      <div class="page-header">
        <h1>Watch History</h1>
        <p>Videos watched across all devices <span style="font-size: 12px; color: var(--text-secondary);">(Auto-refreshes every 5s)</span></p>
      </div>
      
      ${history.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🎬</div>
          <h3>No watch history yet</h3>
          <p>Run the test script to add sample videos</p>
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
async function getBlocksPage() {
  const blocks = await ipcRenderer.invoke('db-query', 'SELECT * FROM blocks ORDER BY created_at DESC');

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
async function getDevicesPage() {
  const devices = await ipcRenderer.invoke('db-query', 'SELECT * FROM devices ORDER BY created_at DESC');

  return `
    <div class="page">
      <div class="page-header">
        <h1>Devices</h1>
        <p>Manage registered devices <span style="font-size: 12px; color: var(--text-secondary);">(Auto-refreshes every 5s)</span></p>
      </div>
      
      ${devices.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📱</div>
          <h3>No devices registered</h3>
          <p>Run: <code>.\\test-api.ps1</code> to register a test device</p>
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
  currentTheme = localStorage.getItem('theme') || 'light';

  return `
    <div class="page">
      <div class="page-header">
        <h1>Settings</h1>
        <p>Configure your YouTube Monitor</p>
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
        <h3>Database</h3>
        <p><strong>Location:</strong> <code style="font-size: 11px;">%APPDATA%\\youtube-monitor\\youtube-monitor.db</code></p>
        <button class="btn" onclick="openDatabaseFolder()" style="margin-top: 10px;">Open Database Folder</button>
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
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    });
  }
}

window.openDatabaseFolder = function() {
  ipcRenderer.send('open-database-folder');
};

// Theme functions
function loadTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  applyTheme(theme);
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
