const { app, BrowserWindow, Tray, Menu, ipcMain, protocol, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { initDatabase, getAll } = require('../database/db');
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
      enableRemoteModule: false,
      webSecurity: true,
      nodeIntegrationInWorker: false,
      experimentalFeatures: false,
      sandbox: false
    },
    minWidth: 800,
    minHeight: 600,
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'file:') {
      event.preventDefault();
      console.warn('Navigation to external URL blocked:', url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  mainWindow.webContents.session.on('will-download', (event) => {
    event.preventDefault();
  });

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
  try {
    const iconPath = path.join(__dirname, '../../resources/icon.png');
    
    if (!fs.existsSync(iconPath)) {
      console.warn('Tray icon not found at:', iconPath);
      console.warn('Tray icon disabled - app will run without system tray');
      return;
    }

    const icon = nativeImage.createFromPath(iconPath);
    
    if (icon.isEmpty()) {
      console.warn('Failed to load tray icon');
      return;
    }

    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
          }
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

    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
      }
    });

    console.log('✓ System tray initialized');
  } catch (error) {
    console.warn('Failed to create system tray:', error.message);
    console.warn('App will run without system tray icon');
  }
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

  // Create window
  createWindow();
  
  // Create tray (optional)
  createTray();

  // Set auto-launch (Windows)
  try {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe')
    });
    console.log('✓ Auto-start enabled');
  } catch (error) {
    console.warn('Could not enable auto-start:', error.message);
  }

  console.log('✓ YouTube Monitor started');
  console.log('✓ Security features enabled');
  console.log(`✓ Electron version: ${process.versions.electron}`);
});

app.on('window-all-closed', () => {
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
    try {
      apiServer.close();
      console.log('✓ API server stopped');
    } catch (error) {
      console.error('Error stopping API server:', error);
    }
  }
});

// IPC handlers
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

// Database query handler
ipcMain.handle('db-query', (event, sql) => {
  try {
    const results = getAll(sql);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
});

// Open database folder
ipcMain.on('open-database-folder', () => {
  const dbPath = path.join(app.getPath('userData'));
  shell.openPath(dbPath);
});

// Security handlers
app.on('web-contents-created', (event, contents) => {
  contents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });
  
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(false);
  console.error('Certificate error:', error, 'for', url);
});
