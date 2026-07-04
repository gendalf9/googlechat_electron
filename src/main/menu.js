// Application menu — extracted from main.js:522-631.
//
// M2 (technical review): getWindow uses BrowserWindow.getAllWindows().find
// (leak-fix pattern), not a state getter. Version string is hardcoded here
// matching main.js:621; Phase 3 (debt cleanup) replaces it with app.getVersion().
// n3: '붙여넣' typo on the paste item (main.js:585) is PRESERVED — fixing it is
// a separate user-visible behavior change, out of scope for this refactor.

const { app, BrowserWindow, Menu, dialog } = require('electron');

function getLiveWindow() {
  return BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
}

function createMenu() {
  const template = [
    {
      label: '파일',
      submenu: [
        {
          label: '새로고침',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            const win = getLiveWindow();
            if (win) {
              win.webContents.reload();
            }
          }
        },
        {
          label: '강제 새로고침',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            const win = getLiveWindow();
            if (win) {
              win.webContents.reloadIgnoringCache();
            }
          }
        },
        ...(process.env.NODE_ENV === 'development'
          ? [
              {
                label: '개발자 도구',
                accelerator: 'F12',
                click: () => {
                  const win = getLiveWindow();
                  if (win) {
                    win.webContents.toggleDevTools();
                  }
                }
              }
            ]
          : []),
        { type: 'separator' },
        {
          label: '종료',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: '편집',
      submenu: [
        { role: 'undo', label: '실행 취소' },
        { role: 'redo', label: '다시 실행' },
        { type: 'separator' },
        { role: 'cut', label: '잘라내기' },
        { role: 'copy', label: '복사' },
        { role: 'paste', label: '붙여넣' }, // n3: known typo preserved (main.js:585)
        { role: 'selectall', label: '전체 선택' }
      ]
    },
    {
      label: '보기',
      submenu: [
        { role: 'reload', label: '새로고침' },
        { role: 'forcereload', label: '강제 새로고침' },
        { type: 'separator' },
        { role: 'resetzoom', label: '확대/축소 초기화' },
        { role: 'zoomin', label: '확대' },
        { role: 'zoomout', label: '축소' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '전체 화면' }
      ]
    },
    {
      label: '창',
      submenu: [
        { role: 'minimize', label: '최소화' },
        { role: 'close', label: '닫기' }
      ]
    },
    {
      label: '도움말',
      submenu: [
        {
          label: '정보',
          click: () => {
            const win = getLiveWindow();
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'Google Chat Desktop',
              message: 'Google Chat Desktop',
              detail: `Version ${app.getVersion()}\nElectron 기반 Google Chat 데스크탑 앱`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };
