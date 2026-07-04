// IPC handlers — extracted from main.js:740-822.
// F2 (technical review): single file, not a subdirectory of micro-files.
// registerIpc({ getMainWindow, showNotification }) wires all 6 channels.
//
// Channel names and signatures are UNCHANGED (API Surface Parity).
// Asymmetry (m3): 4 channels are renderer→main sends; 2 (get-memory-info,
// request-memory-cleanup) are main→renderer executeJavaScript round-trips.

const { ipcMain, shell, Notification } = require('electron');

function registerIpc({ getMainWindow, showNotification }) {
  ipcMain.on('show-notification', (_event, title, body) => {
    showNotification(title, body);
  });

  ipcMain.on('hide-window', () => {
    const win = getMainWindow();
    if (win) {
      win.hide();
    }
  });

  ipcMain.on('open-external', (_event, url) => {
    shell.openExternal(url);
  });

  // download-file: Google Chat attachment URLs need auth → defer to system
  // browser. Preserves the chat.google.com/get_attachment_url branch.
  ipcMain.on('download-file', async (_event, url, fileName) => {
    try {
      console.log('다운로드 요청:', url, fileName);

      if (url.includes('chat.google.com') && url.includes('get_attachment_url')) {
        await shell.openExternal(url);
        new Notification({
          title: '다운로드',
          body: `${fileName} 다운로드를 브라우저에서 시작합니다.`,
          silent: false
        }).show();
      } else {
        await shell.openExternal(url);
        new Notification({
          title: '링크 열기',
          body: `${fileName} 링크를 브라우저에서 엽니다.`,
          silent: false
        }).show();
      }
    } catch (error) {
      new Notification({
        title: '다운로드 실패',
        body: `다운로드 중 오류가 발생했습니다: ${error.message}`,
        silent: false
      }).show();
    }
  });

  // executeJavaScript round-trip: main asks renderer for perf.memory.
  ipcMain.handle('get-memory-info', async () => {
    const win = getMainWindow();
    if (win && win.webContents) {
      try {
        return await win.webContents.executeJavaScript(
          'window.electronAPI.getPerformanceInfo()'
        );
      } catch (error) {
        console.error('Failed to get memory info:', error);
        return null;
      }
    }
    return null;
  });

  // executeJavaScript round-trip: main asks renderer to run gc + DOM cleanup.
  ipcMain.handle('request-memory-cleanup', async () => {
    const win = getMainWindow();
    if (win && win.webContents) {
      try {
        return await win.webContents.executeJavaScript(
          'window.electronAPI.requestMemoryCleanup()'
        );
      } catch (error) {
        console.error('Failed to cleanup memory:', error);
        return { error: error.message };
      }
    }
    return { error: 'No main window' };
  });
}

module.exports = { registerIpc };
