const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { initDatabase } = require('../database/db');
const { startAPIServer } = require('../api/server');

let mainWindow;
let tray;
let apiServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../../resources/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

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
  await initDatabase();

  // Start API server
  apiServer = await startAPIServer();

  // Create window and tray
  createWindow();
  createTray();

  // Set auto-launch (Windows)
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
  });
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

// IPC handlers
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});
