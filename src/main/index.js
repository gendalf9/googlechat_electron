// Main process entry — extracted from main.js:512-520 (showNotification),
// 633-697 (lifecycle), 700-738 (memory-monitor wiring), 824-832 (process.on).
//
// F7 (technical review): showNotification (9 lines) and process.on handlers
// (2 calls) are folded into index.js rather than separate micro-files.
// mainWindow/tray are module-scoped here; getMainWindow is a null-safe getter
// passed to memory-monitor and ipc (M2 — no state.js getter layer).

const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const { ASSET_ICON } = require('./constants');
const { clearAllTimers, clearAllIntervals } = require('./timers');
const { createWindow } = require('./window');
const { createTray } = require('./tray');
const { createMenu } = require('./menu');
const { startMemoryMonitor } = require('./memory-monitor');
const { registerIpc } = require('./ipc');

let mainWindow = null;
let tray = null;

// Null-safe getter: returns the window only if it exists and is not destroyed.
function getMainWindow() {
  return mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
}

function showNotification(title, body) {
  new Notification({
    title,
    body,
    icon: path.join(app.getAppPath(), ASSET_ICON),
    silent: false,
    urgency: 'normal'
  }).show();
}

// Window factory — also used as the tray recreate callback.
function createMainWindow() {
  mainWindow = createWindow({
    preloadPath: path.join(app.getAppPath(), 'src', 'preload', 'index.js')
  });
  return mainWindow;
}

// CPU optimization (preserved from main.js:633-637).
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-features', 'TranslateUI,BlinkGenPropertyTrees');
app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createMainWindow();
  tray = createTray({ showNotification, createWindow: createMainWindow });
  createMenu();
  startMemoryMonitor(getMainWindow);
  registerIpc({ getMainWindow, showNotification });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  console.log('App quitting - performing global cleanup');

  clearAllTimers();
  clearAllIntervals();

  ipcMain.removeAllListeners();

  if (tray) {
    tray.destroy();
    tray = null;
  }

  const windows = BrowserWindow.getAllWindows();
  windows.forEach(window => {
    if (window && !window.isDestroyed()) {
      window.removeAllListeners();
      if (window.webContents) {
        window.webContents.removeAllListeners();
      }
      window.close();
    }
  });
});

app.on('browser-window-blur', () => {
  const win = getMainWindow();
  if (win) {
    win.webContents.send('app-blurred');
  }
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
