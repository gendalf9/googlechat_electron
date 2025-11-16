const { app, BrowserWindow, Menu, Tray, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#ffffff',
    show: true,
    // CPU 최적화를 위한 창 설정
    paintWhenInitiallyHidden: false,
    transparent: false,
    vibrancy: undefined,
    visualEffectState: 'inactive',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      enableBlinkFeatures: false,
      sandbox: false, // sandbox를 비활성화하여 로딩 문제 해결
      enableRemoteModule: false,
      backgroundThrottling: true, // 백그라운드 스로틀링 활성화
      offscreen: false,
      // CPU 최적화 설정 (필수 기능만 유지)
      spellcheck: false,
      plugins: false,
      javascript: true,
      images: true, // 이미지는 활성화해야 정상 로딩됨
      webgl: false,
      webaudio: false,
      offscreencanvas: false,
      experimentalcanvasfeatures: false,
      // 메모리 최적화
      partition: 'persist:gchat'
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'Google Chat',
    showInactive: false
  });

  // Google Chat 직접 로드
  mainWindow
    .loadURL('https://chat.google.com', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      httpReferrer: 'https://chat.google.com'
    })
    .catch(_error => {
      // 에러 처리 (프로덕션에서는 로그 제거)
    });

  // 창이 준비되면 즉시 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus(); // 강제로 포커스

    // 포커스 설정
    if (process.platform === 'darwin') {
      app.focus();
    }
  });

  // 대체: ready-to-show 이벤트가 발생하지 않을 경우를 대비
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  }, 3000); // 3초 후 강제 표시

  // 개발자 도구 (개발 중에만)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 새 창 열기 제어 - 모든 외부 링크는 시스템 브라우저에서 열기
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Google Chat 도메인이 아닌 모든 외부 링크는 시스템 브라우저에서 열기
    if (!url.includes('chat.google.com') && !url.includes('google.com/chat')) {
      require('electron').shell.openExternal(url);
    }
    // 새 창 방지
    return { action: 'deny' };
  });

  // 네비게이션 제어 - Google Chat 외부 페이지 이동 방지
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Google Chat 도메인이 아니면 이동 방지 및 시스템 브라우저에서 열기
    if (
      !parsedUrl.hostname.includes('chat.google.com') &&
      !parsedUrl.hostname.includes('google.com')
    ) {
      event.preventDefault();
      require('electron').shell.openExternal(navigationUrl);
    }
  });

  // 우클릭 메뉴 활성화
  mainWindow.webContents.on('context-menu', (event, params) => {
    event.preventDefault();
    const { Menu } = require('electron');

    const contextMenuTemplate = [
      { role: 'cut', label: '잘라내기' },
      { role: 'copy', label: '복사' },
      { role: 'paste', label: '붙여넣기' },
      { type: 'separator' },
      { role: 'selectAll', label: '전체 선택' },
      { type: 'separator' },
      {
        label: '검색',
        click: () => {
          const selectedText = params.selectionText;
          if (selectedText) {
            require('electron').shell.openExternal(
              `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`
            );
          }
        }
      },
      {
        label: '링크 열기',
        click: () => {
          if (params.linkURL) {
            require('electron').shell.openExternal(params.linkURL);
          }
        },
        visible: params.linkURL !== ''
      }
    ];

    const menu = Menu.buildFromTemplate(contextMenuTemplate);
    menu.popup();
  });

  // Google Chat 로드 후 CPU 최적화 및 링크 처리
  mainWindow.webContents.on('did-finish-load', () => {
    // 필수적인 리플로우 기능 유지하면서 CPU 최적화
    mainWindow.webContents.executeJavaScript(`
      // 필수 기능만 유지하는 최적화 스타일
      const style = document.createElement('style');
      style.textContent = \`
        // 불필요한 애니메이션만 줄이기 (완전히 제거하지 않음)
        * {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }

        // 불필요한 요소만 숨기기
        .loading-indicator, .spinner, .progress {
          display: none !important;
        }

        // 입력 필드 관련 스타일은 유지
        input, textarea, [contenteditable="true"] {
          animation: none !important;
          transition: none !important;
        }
      \`;
      document.head.appendChild(style);

      // 외부 링크 처리 설정
      function setupExternalLinks() {
        // 모든 외부 링크를 시스템 브라우저에서 열기
        document.addEventListener('click', function(e) {
          const target = e.target.closest('a');
          if (target && target.href) {
            if (!target.href.includes('chat.google.com') && !target.href.includes('google.com/chat')) {
              e.preventDefault();
              e.stopPropagation();
              if (window.electronAPI && window.electronAPI.openExternal) {
                window.electronAPI.openExternal(target.href);
              }
            }
          }
        }, true);
      }

      // 우클릭 이벤트 허용 (Google Chat 우클릭 메뉴 활성화)
      document.addEventListener('contextmenu', function(event) {
        // Google Chat의 기본 우클릭 동작 허용
        event.stopImmediatePropagation();
      }, true);

      // requestIdleCallback를 사용한 CPU 사용량 최적화 (필수 이벤트는 유지)
      if ('requestIdleCallback' in window) {
        const optimizePerformance = () => {
          // 불필요한 이벤트 리스너만 제거 (입력 관련 이벤트는 유지)
          const events = ['mousemove', 'mouseover'];
          events.forEach(eventType => {
            document.removeEventListener(eventType, () => {}, true);
          });

          // 외부 링크 처리 설정
          setupExternalLinks();
        };

        requestIdleCallback(optimizePerformance, { timeout: 3000 });
      } else {
        // fallback
        setTimeout(setupExternalLinks, 2000);
      }
    `);
  });

  // 메모리 관리
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', event => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Google Chat 열기',
      accelerator: 'CmdOrCtrl+Shift+G',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
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
    {
      type: 'separator'
    },
    {
      label: '종료',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Google Chat Desktop');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      createWindow();
    }
  });
}

function showNotification(title, body) {
  new Notification({
    title,
    body,
    icon: path.join(__dirname, 'assets/icon.png'),
    silent: false,
    urgency: 'normal'
  }).show();
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
            if (mainWindow) {
              mainWindow.webContents.reload();
            }
          }
        },
        {
          label: '강제 새로고침',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reloadIgnoringCache();
            }
          }
        },
        {
          label: '개발자 도구',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          type: 'separator'
        },
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
        { role: 'paste', label: '붙여넣' },
        { role: 'selectall', label: '전체 선택' }
      ]
    },
    {
      label: '보기',
      submenu: [
        { role: 'reload', label: '새로고침' },
        { role: 'forcereload', label: '강제 새로고침' },
        { role: 'toggledevtools', label: '개발자 도구' },
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
            require('electron').dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Google Chat Desktop',
              message: 'Google Chat Desktop',
              detail:
                'Version 1.0.0 (Optimized)\nElectron 기반 Google Chat 데스크탑 앱\n\n최적화된 성능으로 더 빠른 실행 속도를 제공합니다.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 앱 시작 전 CPU 최적화 (GPU 부분적으로 활성화하여 로딩 문제 해결)
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-features', 'TranslateUI,BlinkGenPropertyTrees');
// GPU를 완전히 비활성화하면 페이지가 로드되지 않으므로 일부만 비활성화
app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createWindow();
  createTray();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
});

// 메모리 정리
app.on('browser-window-blur', () => {
  if (mainWindow) {
    mainWindow.webContents.send('app-blurred');
  }
});

// 알림 핸들러
ipcMain.on('show-notification', (event, title, body) => {
  showNotification(title, body);
});

// 창 숨기기 핸들러
ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

// 외부 링크 핸들러
ipcMain.on('open-external', (event, url) => {
  const { shell } = require('electron');
  shell.openExternal(url);
});

// 성능 모니터링
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
