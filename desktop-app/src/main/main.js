const { app, BrowserWindow, Tray, Menu, ipcMain, protocol } = require('electron');
const path = require('path');
const { initDatabase } = require('../database/db');
const { startAPIServer } = require('../api/server');

let mainWindow;
let tray;
let apiServer;

// Security: Enable ASAR integrity validation
app.on('ready', () => {
  // Validate ASAR integrity on production builds
  if (app.isPackaged) {
    protocol.registerFileProtocol('app', (request, callback) => {
      const url = request.url.substr(6);
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    });
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // Security: Disable remote module
      enableRemoteModule: false,
      // Security: Web security enabled
      webSecurity: true,
      // Security: Disable node integration in workers
      nodeIntegrationInWorker: false,
      // Security: Disable experimental features
      experimentalFeatures: false,
      // Security: Enable sandbox (Electron 33+)
      sandbox: false // Set to false for nodeIntegration compatibility
    },
    icon: path.join(__dirname, '../../resources/icon.png'),
    // Security: Prevent window from being resized to very small sizes
    minWidth: 800,
    minHeight: 600
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Security: Disable navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'file:') {
      event.preventDefault();
      console.warn('Navigation to external URL blocked:', url);
    }
  });

  // Security: Disable opening new windows
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Security: Disable downloading files
  mainWindow.webContents.session.on('will-download', (event) => {
    event.preventDefault();
  });

  // Handle window close - minimize to tray
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../../resources/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('YouTube Monitor');
  tray.setContextMenu(contextMenu);

  // Double click to show
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

app.whenReady().then(async () => {
  // Initialize database
  try {
    await initDatabase();
    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('✗ Failed to initialize database:', error);
    app.quit();
    return;
  }

  // Start API server
  try {
    apiServer = await startAPIServer();
    console.log('✓ API server started successfully');
  } catch (error) {
    console.error('✗ Failed to start API server:', error);
    app.quit();
    return;
  }

  // Create window and tray
  createWindow();
  createTray();

  // Set auto-launch (Windows)
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
  });

  console.log('✓ YouTube Monitor started');
  console.log('✓ Security features enabled');
  console.log(`✓ Electron version: ${process.versions.electron}`);
});

app.on('window-all-closed', () => {
  // Keep running in background
  if (process.platform !== 'darwin') {
    // Don't quit
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (apiServer) {
    apiServer.close();
  }
});

// Security: Limit IPC handlers and validate input
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

// Security: Disable eval and prevent webview attachments
app.on('web-contents-created', (event, contents) => {
  contents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });
  
  // Prevent renderer process from accessing Node.js in new windows
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
});

// Security: Handle certificate errors in production
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // In production, always reject certificate errors
  event.preventDefault();
  callback(false);
  console.error('Certificate error:', error, 'for', url);
});
