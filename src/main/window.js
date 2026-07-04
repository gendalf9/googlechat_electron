// Main window — extracted from main.js:11-454 (createWindow + cleanupWindow).
// The largest module, but mostly delegates to navigation-guard, context-menu,
// session-download-handler, and optimization-injection.
//
// createWindow({ preloadPath }) returns the BrowserWindow. index.js holds the
// reference and exposes it via a getMainWindow getter to memory-monitor/ipc.

const { app, BrowserWindow } = require('electron');
const path = require('path');
const {
  WINDOW_CONFIG,
  WINDOW_TITLE,
  GOOGLE_CHAT_URL,
  HTTP_REFERRER,
  USER_AGENT,
  ASSET_ICON,
  SHOW_FALLBACK_DELAY_MS
} = require('./constants');
const { trackTimer, clearAllTimers, clearAllIntervals } = require('./timers');
const { createWindowOpenHandler, createNavigationHandler } = require('./navigation-guard');
const { createContextMenuHandler } = require('./context-menu');
const { setupSessionDownloadHandler } = require('./session-download-handler');
const { injectOptimizations } = require('./optimization-injection');

function createWindow({ preloadPath }) {
  const mainWindow = new BrowserWindow({
    ...WINDOW_CONFIG,
    show: true,
    paintWhenInitiallyHidden: false,
    transparent: false,
    vibrancy: undefined,
    visualEffectState: 'inactive',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      enableBlinkFeatures: false,
      sandbox: false, // disabled to resolve loading issues (preserved)
      enableRemoteModule: false,
      backgroundThrottling: true,
      offscreen: false,
      spellcheck: false,
      plugins: false,
      javascript: true,
      images: true,
      webgl: false,
      webaudio: false,
      offscreencanvas: false,
      experimentalcanvasfeatures: false,
      partition: 'persist:gchat'
    },
    icon: path.join(app.getAppPath(), ASSET_ICON),
    title: WINDOW_TITLE,
    showInactive: false
  });

  // Critical Memory Leak Fix #5: track webContents handlers for cleanup.
  mainWindow._webContentsEventHandlers = new Map();
  const trackWebContentsHandler = (event, handler) => {
    if (mainWindow._webContentsEventHandlers) {
      mainWindow._webContentsEventHandlers.set(event, handler);
    }
    return mainWindow.webContents.on(event, handler);
  };

  // Load Google Chat directly.
  mainWindow
    .loadURL(GOOGLE_CHAT_URL, { userAgent: USER_AGENT, httpReferrer: HTTP_REFERRER })
    .catch(_error => {
      // Error handling omitted in production (preserved).
    });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    if (process.platform === 'darwin') {
      app.focus();
    }
  });

  // Fallback: force-show if ready-to-show never fires.
  trackTimer(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  }, SHOW_FALLBACK_DELAY_MS);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // External links → system browser; deny all new windows.
  mainWindow.webContents.setWindowOpenHandler(createWindowOpenHandler());

  // Session download handler (Korean filename decode, macOS notifications).
  setupSessionDownloadHandler(mainWindow);

  // Block off-domain top-level navigations.
  trackWebContentsHandler('will-navigate', createNavigationHandler());

  // Right-click context menu.
  const contextMenu = createContextMenuHandler();
  trackWebContentsHandler('context-menu', contextMenu.handler);
  mainWindow.on('closed', contextMenu.destroy);

  // Inject renderer optimizations on did-finish-load.
  trackWebContentsHandler('did-finish-load', () => {
    injectOptimizations(mainWindow.webContents);
  });

  // Teardown. M3: clears the GLOBAL timers/intervals Sets (single-window
  // invariant — see timers.js).
  const cleanupWindow = () => {
    clearAllTimers();
    clearAllIntervals();

    if (mainWindow && mainWindow.webContents && mainWindow.webContents.session) {
      if (mainWindow._downloadHandler) {
        mainWindow.webContents.session.removeListener('will-download', mainWindow._downloadHandler);
        mainWindow._downloadHandler = null;
      }
      mainWindow.webContents.session.removeAllListeners('will-download');
    }

    if (mainWindow && mainWindow.webContents) {
      if (mainWindow._webContentsEventHandlers) {
        mainWindow._webContentsEventHandlers.forEach((handler, event) => {
          mainWindow.webContents.removeListener(event, handler);
        });
        mainWindow._webContentsEventHandlers.clear();
        mainWindow._webContentsEventHandlers = null;
      }
      mainWindow.webContents.removeAllListeners();
    }
  };

  mainWindow.on('closed', cleanupWindow);

  // Hide-to-tray unless quitting.
  mainWindow.on('close', event => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  return mainWindow;
}

module.exports = { createWindow };
