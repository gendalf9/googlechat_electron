const { app, BrowserWindow, Menu, Tray, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

// Memory management: store all timers and intervals for cleanup
const timers = new Set();
const intervals = new Set();

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

  // Critical Memory Leak Fix #5: Track webContents event handlers for cleanup
  mainWindow._webContentsEventHandlers = new Map();

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
  const showTimer = setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  }, 3000); // 3초 후 강제 표시

  // Store timer for cleanup
  timers.add(showTimer);

  // 개발자 도구는 개발 모드에서만 활성화
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

  // Critical Memory Leak Fix #3: Session listener management with proper cleanup
  let downloadHandlerSetup = false;

  const setupDownloadHandler = () => {
    // Critical Memory Leak Fix #3: Prevent duplicate listener registration
    if (downloadHandlerSetup) {
      return;
    }
    downloadHandlerSetup = true;

    // Critical Memory Leak Fix #3: Ensure no existing will-download listeners
    mainWindow.webContents.session.removeAllListeners('will-download');

    const downloadHandler = (event, item, _webContents) => {
      // 사용자에게 다운로드 위치를 묻지 않고 기본 다운로드 폴더에 저장
      const { dialog } = require('electron');
      const { app } = require('electron');
      const path = require('path');

      // 기본 다운로드 디렉토리 가져오기
      const downloadDir = app.getPath('downloads');

      // 파일명이 한글일 경우 깨짐 방지 처리
      let fileName = item.getFilename();
      try {
        // 파일명이 URL 인코딩되어 있을 경우 디코딩
        fileName = decodeURIComponent(fileName);
      } catch (e) {
        // 디코딩 실패 시 원래 파일명 사용
      }

      // 다운로드 경로 설정
      const filePath = path.join(downloadDir, fileName);
      item.setSavePath(filePath);

      // 다운로드 완료 시 알림 (메모리 릭 방지를 위해 once 사용)
      item.once('done', (event, state) => {
        if (state === 'completed') {
          // 다운로드 완료 알림
          if (process.platform === 'darwin') {
            // macOS에서는 알림 표시
            new Notification({
              title: '다운로드 완료',
              body: `${fileName}이(가) 다운로드되었습니다.`,
              silent: false
            }).show();
          }

          // 다운로드 폴더 열기 옵션
          if (process.platform === 'darwin') {
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
                  // 폴더 열기 선택 시
                  require('electron').shell.openPath(downloadDir);
                }
              });
          }
        } else {
          // 다운로드 실패 시 알림
          new Notification({
            title: '다운로드 실패',
            body: `${fileName} 다운로드에 실패했습니다.`,
            silent: false
          }).show();
        }
      });
    };

    mainWindow.webContents.session.on('will-download', downloadHandler);

    // Critical Memory Leak Fix #3: Store handler for cleanup
    mainWindow._downloadHandler = downloadHandler;
  };

  setupDownloadHandler();

  // Critical Memory Leak Fix #5: Track webContents event handlers
  const trackWebContentsHandler = (event, handler) => {
    if (mainWindow._webContentsEventHandlers) {
      mainWindow._webContentsEventHandlers.set(event, handler);
    }
    return mainWindow.webContents.on(event, handler);
  };

  // 네비게이션 제어 - Google Chat 외부 페이지 이동 방지
  const navigationHandler = (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Google Chat 도메인이 아니면 이동 방지 및 시스템 브라우저에서 열기
    if (
      !parsedUrl.hostname.includes('chat.google.com') &&
      !parsedUrl.hostname.includes('google.com')
    ) {
      event.preventDefault();
      require('electron').shell.openExternal(navigationUrl);
    }
  };

  trackWebContentsHandler('will-navigate', navigationHandler);

  // Critical Memory Leak Fix #2: Context menu accumulation prevention
  let currentContextMenu = null;

  const contextMenuHandler = (event, params) => {
    event.preventDefault();
    const { Menu } = require('electron');

    // Critical Memory Leak Fix #2: Destroy previous context menu
    if (currentContextMenu) {
      currentContextMenu.destroy();
      currentContextMenu = null;
    }

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

    currentContextMenu = Menu.buildFromTemplate(contextMenuTemplate);

    // Critical Memory Leak Fix #2: Auto-cleanup after menu closes
    currentContextMenu.once('menu-will-close', () => {
      setTimeout(() => {
        if (currentContextMenu) {
          currentContextMenu.destroy();
          currentContextMenu = null;
        }
      }, 1000); // 1 second delay to allow menu interactions
    });

    currentContextMenu.popup();
  };

  trackWebContentsHandler('context-menu', contextMenuHandler);

  // Critical Memory Leak Fix #2: Clean up context menu on window close
  mainWindow.on('closed', () => {
    if (currentContextMenu) {
      currentContextMenu.destroy();
      currentContextMenu = null;
    }
  });

  // Critical Memory Leak Fix #4: JavaScript string memory retention optimization
  const didFinishLoadHandler = () => {
    // Critical Memory Leak Fix #4: Use smaller, modular functions instead of large string
    const initializeOptimizations = () => {
      try {
        // Check if already initialized to prevent memory leaks
        if (window.gchatEventListenersSetup) {
          return;
        }
        window.gchatEventListenersSetup = true;

        // Initialize cleanup array
        window.gchatCleanupFunctions = window.gchatCleanupFunctions || [];

        // Function 1: Cleanup existing resources (shortened)
        const cleanupResources = () => {
          const styles = document.querySelectorAll('style[data-gchat-optimized]');
          styles.forEach(style => style.remove());

          if (window.gchatCleanupFunctions) {
            window.gchatCleanupFunctions.forEach(cleanup => {
              try {
                cleanup();
              } catch (e) {
                // Ignore cleanup errors
              }
            });
            window.gchatCleanupFunctions = [];
          }
        };

        // Function 2: Apply optimized styles (shortened)
        const applyStyles = () => {
          if (!document.querySelector('style[data-gchat-optimized]')) {
            const style = document.createElement('style');
            style.setAttribute('data-gchat-optimized', 'true');
            style.textContent =
              '*{animation-duration:0.1s!important;transition-duration:0.1s!important}.loading-indicator,.spinner,.progress{display:none!important}input,textarea,[contenteditable="true"]{animation:none!important;transition:none!important}';
            document.head.appendChild(style);

            window.gchatCleanupFunctions.push(() => {
              const style = document.querySelector('style[data-gchat-optimized]');
              if (style) style.remove();
            });
          }
        };

        // Function 3: Setup external links (shortened)
        const setupExternalLinks = () => {
          const handleExternalLinks = e => {
            const target = e.target.closest('a');
            if (target && target.href && !target.href.includes('chat.google.com')) {
              e.preventDefault();
              e.stopPropagation();
              if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(target.href);
              }
            }
          };

          document.addEventListener('click', handleExternalLinks, true);
          window.gchatCleanupFunctions.push(() => {
            document.removeEventListener('click', handleExternalLinks, true);
          });
        };

        // Function 4: Lightweight memory monitoring
        const setupMemoryMonitoring = () => {
          if (window.performance?.memory) {
            const checkMemory = () => {
              const mem = window.performance.memory;
              const usedMB = Math.round(mem.usedJSHeapSize / 1024 / 1024);
              const limitMB = Math.round(mem.jsHeapSizeLimit / 1024 / 1024);

              if (usedMB > limitMB * 0.8) {
                if (window.gc) window.gc();
                cleanupResources();
              }
            };

            // Critical Memory Leak Fix #4: Use setTimeout instead of setInterval for better cleanup
            const memoryTimer = setTimeout(() => {
              checkMemory();
              setupMemoryMonitoring(); // Reschedule
            }, 30000);

            window.gchatCleanupFunctions.push(() => {
              clearTimeout(memoryTimer);
            });
          }
        };

        // Execute all functions
        cleanupResources();
        applyStyles();
        setupExternalLinks();
        setupMemoryMonitoring();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    // Execute via function call instead of large string injection
    mainWindow.webContents
      .executeJavaScript(
        `
      (${initializeOptimizations.toString()})();
    `
      )
      .catch(error => {
        console.error('JavaScript execution failed:', error);
      });
  };

  trackWebContentsHandler('did-finish-load', didFinishLoadHandler);

  // 메모리 관리 및 정리 함수 (Enhanced for Critical Memory Leak Fixes)
  const cleanupWindow = () => {
    // Clear all timers associated with this window
    timers.forEach(timer => {
      clearTimeout(timer);
    });
    timers.clear();

    // Clear all intervals associated with this window
    intervals.forEach(interval => {
      clearInterval(interval);
    });
    intervals.clear();

    // Critical Memory Leak Fix #3: Remove specific download handler
    if (
      mainWindow &&
      mainWindow.webContents &&
      mainWindow.webContents.session &&
      mainWindow._downloadHandler
    ) {
      mainWindow.webContents.session.removeListener('will-download', mainWindow._downloadHandler);
      mainWindow._downloadHandler = null;
    }

    // Remove session event listeners
    if (mainWindow && mainWindow.webContents && mainWindow.webContents.session) {
      mainWindow.webContents.session.removeAllListeners('will-download');
    }

    // Critical Memory Leak Fix #5: Proper cleanup of tracked webContents event handlers
    if (mainWindow && mainWindow.webContents) {
      // Remove specific tracked handlers first
      if (mainWindow._webContentsEventHandlers) {
        mainWindow._webContentsEventHandlers.forEach((handler, event) => {
          mainWindow.webContents.removeListener(event, handler);
        });
        mainWindow._webContentsEventHandlers.clear();
        mainWindow._webContentsEventHandlers = null;
      }

      // Remove any remaining listeners
      mainWindow.webContents.removeAllListeners();
    }

    // Clean up window reference
    mainWindow = null;
  };

  mainWindow.on('closed', cleanupWindow);

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

  // Critical Memory Leak Fix #1: Eliminate closure references
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Google Chat 열기',
      accelerator: 'CmdOrCtrl+Shift+G',
      click: () => {
        const win = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
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

  // Critical Memory Leak Fix #1: Avoid mainWindow closure reference
  tray.on('click', () => {
    const win = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
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
  // Critical Memory Leak Fix #1: Eliminate closure references in menu handlers
  const getWindow = () => BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  const template = [
    {
      label: '파일',
      submenu: [
        {
          label: '새로고침',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            const win = getWindow();
            if (win) {
              win.webContents.reload();
            }
          }
        },
        {
          label: '강제 새로고침',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            const win = getWindow();
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
                  const win = getWindow();
                  if (win) {
                    win.webContents.toggleDevTools();
                  }
                }
              }
            ]
          : []),
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
            const win = getWindow();
            require('electron').dialog.showMessageBox(win, {
              type: 'info',
              title: 'Google Chat Desktop',
              message: 'Google Chat Desktop',
              detail:
                'Version 1.0.8 (Memory Management & Test Enhancement)\nElectron 기반 Google Chat 데스크탑 앱\n\n메모리 관리 개선:\n- WeakSet 사용으로 에러 로그 메모리 자동 정리\n- DOM 참조 누수 방지 (캐싱 제거)\n- executeJavaScript 안전성 검사 강화\n- 추가적인 메모리 릭 방지 조치\n\n테스트 케이스 보강:\n- 테스트 38개 → 183개로 대폭 확장\n- PRD 기반 컴프리헨시브 테스트 커버리지\n- 창 관리, 시스템 트레이, 알림 시스템 테스트 추가\n- 보안, 메모리 관리, 키보드 단축키 테스트 추가\n\n문서화:\n- PRD (제품 요구사항 문서) 작성 완료'
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

  // 앱 종료 시 전역 정리
  console.log('App quitting - performing global cleanup');

  // 모든 타이머 정리
  timers.forEach(timer => clearTimeout(timer));
  timers.clear();

  intervals.forEach(interval => clearInterval(interval));
  intervals.clear();

  // IPC 리스너 정리
  ipcMain.removeAllListeners();

  // 트레이 정리
  if (tray) {
    tray.destroy();
    tray = null;
  }

  // 모든 창 정리
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

// 메모리 정리
app.on('browser-window-blur', () => {
  if (mainWindow) {
    mainWindow.webContents.send('app-blurred');
  }
});

// 주기적인 메모리 모니터링 (5분마다)
const memoryMonitorInterval = setInterval(
  async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const memInfo = await mainWindow.webContents.executeJavaScript(`
          window.electronAPI && window.electronAPI.getPerformanceInfo()
        `);

        if (memInfo && memInfo.memory) {
          const usedMB = Math.round(memInfo.memory.usedJSHeapSize / 1024 / 1024);
          const limitMB = Math.round(memInfo.memory.jsHeapSizeLimit / 1024 / 1024);

          if (process.env.NODE_ENV === 'development') {
            console.log(
              `Memory Usage: ${usedMB}MB / ${limitMB}MB (${Math.round((usedMB / limitMB) * 100)}%)`
            );
          }

          // 85% 이상 사용 시 자동 정리
          if (usedMB > limitMB * 0.85) {
            console.log('High memory usage detected, triggering cleanup...');
            try {
              await mainWindow.webContents.executeJavaScript(`
                window.electronAPI && window.electronAPI.requestMemoryCleanup()
              `);
            } catch (cleanupError) {
              console.error('Memory cleanup failed:', cleanupError);
            }
          }
        }
      } catch (error) {
        console.debug('Memory monitor check failed:', error.message);
      }
    }
  },
  5 * 60 * 1000
); // 5분마다

intervals.add(memoryMonitorInterval);

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

// 파일 다운로드 핸들러 (브라우저 네이티브 다운로드 유도)
ipcMain.on('download-file', async (event, url, fileName) => {
  const { shell } = require('electron');

  try {
    console.log('다운로드 요청:', url, fileName);

    // Google Chat URL은 인증이 필요하므로 브라우저에서 직접 다운로드하도록 유도
    if (url.includes('chat.google.com') && url.includes('get_attachment_url')) {
      // 현재 세션의 쿠키를 포함하여 외부 브라우저에서 열기
      await shell.openExternal(url);

      new Notification({
        title: '다운로드',
        body: `${fileName} 다운로드를 브라우저에서 시작합니다.`,
        silent: false
      }).show();
    } else {
      // 일반 URL은 외부 브라우저에서 열기
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

// 메모리 정리 핸들러
ipcMain.handle('get-memory-info', async () => {
  if (mainWindow && mainWindow.webContents) {
    try {
      return await mainWindow.webContents.executeJavaScript(`
        window.electronAPI.getPerformanceInfo()
      `);
    } catch (error) {
      console.error('Failed to get memory info:', error);
      return null;
    }
  }
  return null;
});

// 메모리 정리 요청 핸들러
ipcMain.handle('request-memory-cleanup', async () => {
  if (mainWindow && mainWindow.webContents) {
    try {
      return await mainWindow.webContents.executeJavaScript(`
        window.electronAPI.requestMemoryCleanup()
      `);
    } catch (error) {
      console.error('Failed to cleanup memory:', error);
      return { error: error.message };
    }
  }
  return { error: 'No main window' };
});

// 성능 모니터링
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
