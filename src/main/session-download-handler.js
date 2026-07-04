// Session download handler — extracted from main.js:105-185.
// Wires webContents.session 'will-download' with Korean-filename decoding and
// macOS completion notification + "open folder" dialog. Preserves the
// duplicate-listener-prevention flag (#3) and the per-window handler storage
// on mainWindow._downloadHandler for cleanup.

const { app, dialog, Notification } = require('electron');
const path = require('path');

// Pure helper (Phase 4 unit-test target): URL-decode a filename, falling back
// to the original on malformed input. Preserves main.js:128-133 try/catch.
function decodeFilename(fileName) {
  try {
    return decodeURIComponent(fileName);
  } catch (_e) {
    return fileName;
  }
}

function setupSessionDownloadHandler(mainWindow) {
  // Critical Memory Leak Fix #3: prevent duplicate listener registration.
  if (mainWindow._downloadHandlerSetup) {
    return;
  }
  mainWindow._downloadHandlerSetup = true;

  // Ensure no stale listeners before registering.
  mainWindow.webContents.session.removeAllListeners('will-download');

  const downloadHandler = (_event, item, _webContents) => {
    const downloadDir = app.getPath('downloads');
    const fileName = decodeFilename(item.getFilename());
    const filePath = path.join(downloadDir, fileName);
    item.setSavePath(filePath);

    // 'done' fires once — no accumulation risk.
    item.once('done', (_doneEvent, state) => {
      if (state === 'completed') {
        if (process.platform === 'darwin') {
          new Notification({
            title: '다운로드 완료',
            body: `${fileName}이(가) 다운로드되었습니다.`,
            silent: false
          }).show();

          dialog
            .showMessageBox(mainWindow, {
              type: 'info',
              buttons: ['확인', '폴더 열기'],
              defaultId: 0,
              title: '다운로드 완료',
              message: '파일 다운로드가 완료되었습니다.',
              detail: `${fileName} 파일이 다운로드 폴더에 저장되었습니다.`
            })
            .then(result => {
              if (result.response === 1) {
                const { shell } = require('electron');
                shell.openPath(downloadDir);
              }
            });
        }
      } else {
        new Notification({
          title: '다운로드 실패',
          body: `${fileName} 다운로드에 실패했습니다.`,
          silent: false
        }).show();
      }
    });
  };

  mainWindow.webContents.session.on('will-download', downloadHandler);
  mainWindow._downloadHandler = downloadHandler;
}

module.exports = { decodeFilename, setupSessionDownloadHandler };
