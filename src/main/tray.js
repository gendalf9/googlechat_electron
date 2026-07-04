// System tray — extracted from main.js:456-510.
//
// M2 (technical review): window lookup uses BrowserWindow.getAllWindows().find
// (the existing leak-fix pattern), NOT a state getter. This always returns a
// live window and avoids destroyed-but-not-null references.

const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const { TRAY_TOOLTIP, ASSET_ICON } = require('./constants');

// Live-window lookup shared by tray click + menu handlers.
function getLiveWindow() {
  return BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
}

// Creates the system tray. showNotification is supplied by index.js (factory
// arg); createWindow is the index.js window factory for the recreate path.
function createTray({ showNotification, createWindow }) {
  const tray = new Tray(path.join(app.getAppPath(), ASSET_ICON));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Google Chat 열기',
      accelerator: 'CmdOrCtrl+Shift+G',
      click: () => {
        const win = getLiveWindow();
        if (win) {
          win.show();
          win.focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: '알림 테스트',
      click: () => {
        showNotification('테스트', '알림 기능이 정상적으로 작동합니다.');
      }
    },
    { type: 'separator' },
    {
      label: '종료',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip(TRAY_TOOLTIP);
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    const win = getLiveWindow();
    if (win) {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
        win.focus();
      }
    } else {
      createWindow();
    }
  });

  return tray;
}

module.exports = { createTray };
