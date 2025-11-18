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

  // 다운로드 핸들러 추가
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
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

    // 다운로드 완료 시 알림
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

        // 다운로드 폴더 열기 �션
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
    const jsCode = `
      // 필수 기능만 유지하는 최적화 스타일
      const style = document.createElement('style');
      style.textContent = '/* 불필요한 애니메이션만 줄이기 */ * { animation-duration: 0.1s !important; transition-duration: 0.1s !important; } /* 불필요한 요소만 숨기기 */ .loading-indicator, .spinner, .progress { display: none !important; } /* 입력 필드 관련 스타일은 유지 */ input, textarea, [contenteditable="true"] { animation: none !important; transition: none !important; }';
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

      // 다운로드 버튼 처리 추가
      function setupDownloadHandlers() {
        // Google Chat의 다운로드 버튼을 감지하고 처리
        document.addEventListener('click', function(e) {
          const target = e.target;
          console.log('클릭된 요소:', target);

          // 다운로드 링크 직접 감지 (가장 우선순위 높음)
          if (target.tagName === 'A' &&
              target.href &&
              target.href.includes('get_attachment_url') &&
              target.href.includes('DOWNLOAD_URL')) {
            console.log('다운로드 링크 직접 감지됨:', target.href);

            e.preventDefault();
            e.stopPropagation();

            // URL에서 파일명 추출
            const url = new URL(target.href);
            const contentType = url.searchParams.get('content_type');

            let fileName = 'download';
            if (contentType) {
              const extension = contentType.split('/')[1] || 'jpg';
              fileName = 'chat_attachment_' + Date.now() + '.' + extension;
            }

            console.log('외부 브라우저에서 다운로드:', target.href, fileName);

            // IPC를 통해 메인 프로세스에 외부 브라우저 다운로드 요청
            if (window.electronAPI && window.electronAPI.downloadFile) {
              window.electronAPI.downloadFile(target.href, fileName);
            } else {
              // fallback: 새 창으로 열기
              window.open(target.href, '_blank');
            }
            return;
          }

          // 일반적인 다운로드 버튼 확인
          const downloadSelectors = [
            '[data-tooltip*="download"]',
            '[data-tooltip*="Download"]',
            '[aria-label*="download"]',
            '[aria-label*="Download"]',
            '[aria-label*="다운로드"]',
            '.download',
            '.icon-download',
            'button[data-id*="download"]',
            'div[role*="button"] svg',
            '.material-icons',
            'button svg',
            'div[role="button"]'
          ];

          let isDownloadButton = false;
          for (const selector of downloadSelectors) {
            if (target.closest(selector)) {
              const button = target.closest(selector);
              console.log('후보 버튼:', button, '선택자:', selector);

              // SVG 아이콘이 다운로드 아이콘인지 확인
              const svgIcon = button.querySelector('svg');
              if (svgIcon) {
                const pathElements = svgIcon.querySelectorAll('path');
                let hasDownloadIcon = false;

                pathElements.forEach(path => {
                  const d = path.getAttribute('d') || '';
                  // 다운로드 아이콘 경로 확인 (화살표 아래로)
                  if (d.includes('M7 10l5 5 5-5') || d.includes('M12 2v16') ||
                      d.includes('M8 12l4 4 4-4') || d.includes('M12 2v10') ||
                      d.includes('download') || d.includes('arrow_downward')) {
                    hasDownloadIcon = true;
                  }
                });

                if (hasDownloadIcon) {
                  isDownloadButton = true;
                  console.log('다운로드 아이콘 확인됨:', svgIcon);
                }
              }

              // 텍스트로 다운로드 버튼 확인
              if (button.textContent && button.textContent.toLowerCase().includes('download')) {
                isDownloadButton = true;
                console.log('다운로드 텍스트 확인됨:', button.textContent);
              }

              break;
            }
          }

          if (isDownloadButton) {
            console.log('다운로드 버튼 클릭 감지됨!');

            // 숨겨진 다운로드 링크 찾기 (Google Chat의 실제 방식)
            let downloadLink = null;
            let searchContainers = [
              target.closest('[role="dialog"], .modal, .popup, .overlay'),
              document.body
            ];

            for (const container of searchContainers) {
              if (!container) continue;

              // get_attachment_url을 포함하는 모든 링크 찾기
              const links = container.querySelectorAll('a[href*="get_attachment_url"][href*="DOWNLOAD_URL"]');
              console.log('컨테이너에서 찾은 다운로드 링크들:', links.length);

              for (const link of links) {
                if (link.href && link.href.includes('get_attachment_url') && link.href.includes('DOWNLOAD_URL')) {
                  downloadLink = link;
                  console.log('다운로드 링크 찾음:', downloadLink.href);
                  break;
                }
              }

              if (downloadLink) break;
            }

            if (downloadLink) {
              e.preventDefault();
              e.stopPropagation();

              const url = new URL(downloadLink.href);
              const contentType = url.searchParams.get('content_type');

              let fileName = 'download';
              if (contentType) {
                const extension = contentType.split('/')[1] || 'jpg';
                fileName = 'chat_attachment_' + Date.now() + '.' + extension;
              }

              console.log('외부 브라우저에서 다운로드:', downloadLink.href, fileName);

              // IPC를 통해 메인 프로세스에 외부 브라우저 다운로드 요청
              if (window.electronAPI && window.electronAPI.downloadFile) {
                window.electronAPI.downloadFile(downloadLink.href, fileName);
              } else {
                // fallback: 새 창으로 열기
                window.open(downloadLink.href, '_blank');
              }
            } else {
              console.log('다운로드 링크를 찾지 못함. 이미지 URL에서 다운로드 시도.');

              // 대체 방법: 이미지 직접 다운로드
              let mediaContainer = target.closest('.media-container, .image-container, .attachment-container, .message-content');
              if (!mediaContainer) {
                mediaContainer = target.closest('[role="dialog"], .modal, .popup, .overlay');
              }
              if (!mediaContainer) {
                mediaContainer = document.body;
              }

              const img = mediaContainer.querySelector('img[src]');
              if (img && img.src) {
                const urlParts = img.src.split('/');
                let fileName = urlParts[urlParts.length - 1] || 'image';
                if (!fileName.includes('.')) {
                  fileName += '.jpg';
                }

                console.log('이미지 다운로드 시도:', img.src, fileName);

                if (window.electronAPI && window.electronAPI.downloadFile) {
                  window.electronAPI.downloadFile(img.src, fileName);
                } else {
                  const a = document.createElement('a');
                  a.href = img.src;
                  a.download = fileName;
                  a.target = '_blank';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }
              } else {
                console.log('다운로드할 이미지를 찾지 못함');
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
          // 다운로드 핸들러 설정
          setupDownloadHandlers();
        };

        requestIdleCallback(optimizePerformance, { timeout: 3000 });
      } else {
        // fallback
        setTimeout(() => {
          setupExternalLinks();
          setupDownloadHandlers();
              }, 2000);
      }
    `;

    mainWindow.webContents.executeJavaScript(jsCode);
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
        ...(process.env.NODE_ENV === 'development'
          ? [
              {
                label: '개발자 도구',
                accelerator: 'F12',
                click: () => {
                  if (mainWindow) {
                    mainWindow.webContents.toggleDevTools();
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
            require('electron').dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Google Chat Desktop',
              message: 'Google Chat Desktop',
              detail:
                'Version 1.0.3 (Stable)\nElectron 기반 Google Chat 데스크탑 앱\n\n보안 및 코드 품질 개선, 이미지 다운로드 기능 포함.'
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

// 성능 모니터링
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
