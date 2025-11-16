const { contextBridge, ipcRenderer } = require('electron');

// 메인 프로세스와 안전하게 통신하기 위한 API 노출
contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) => ipcRenderer.send('show-notification', title, body),
  hideWindow: () => ipcRenderer.send('hide-window'),

  // 외부 링크 열기
  openExternal: url => ipcRenderer.send('open-external', url),

  // 앱 정보
  getAppVersion: () => process.env.APP_VERSION || '1.0.0',

  // 플랫폼 정보
  getPlatform: () => process.platform,

  // 성능 정보
  getPerformanceInfo: () => {
    if (window.performance && window.performance.memory) {
      return {
        memory: window.performance.memory,
        timing: window.performance.timing
      };
    }
    return null;
  }
});

// 페이지 로딩 최적화
window.addEventListener('DOMContentLoaded', () => {
  // 성능 측정 시작
  if (window.performance && window.performance.mark) {
    window.performance.mark('app-start');
  }

  // DOMContentLoaded 이후 최적화
  setTimeout(() => {
    // 불필요한 이벤트 리스너 제거
    cleanupUnusedListeners();

    // 성능 측정 종료
    if (window.performance && window.performance.mark) {
      window.performance.mark('app-ready');
      window.performance.measure('app-loading', 'app-start', 'app-ready');

      const measures = window.performance.getEntriesByName('app-loading');
      if (measures.length > 0) {
        console.log(`App loaded in ${measures[0].duration}ms`);
      }
    }
  }, 100);
});

// 메모리 정리 함수
function cleanupUnusedListeners() {
  // 사용하지 않는 이벤트 리스너 정리
  const unusedElements = document.querySelectorAll('.unused-element');
  unusedElements.forEach(element => {
    element.replaceWith(element.cloneNode(true));
  });
}

// 페이지 제목 변경 감지 (새 메시지 알림 등) - CPU 최적화 버전
let titleObserver = null;
let lastTitle = '';
let titleCheckInterval = null;

function setupTitleObserver() {
  // 더 긴 간격으로 확인하여 CPU 부하 최소화
  if (titleCheckInterval) {
    clearInterval(titleCheckInterval);
  }

  // 10초마다 한 번만 확인하여 CPU 부하 최소화
  titleCheckInterval = setInterval(() => {
    try {
      const currentTitle = document.title;
      if (currentTitle !== lastTitle) {
        lastTitle = currentTitle;

        // 새 메시지가 있는 경우에만 알림 (단순화된 메시지)
        if (
          currentTitle &&
          currentTitle !== 'Google Chat' &&
          currentTitle !== 'Google Chat Desktop'
        ) {
          // 디바운싱 적용 (너무 많은 알림 방지)
          if (window.titleNotificationTimeout) {
            clearTimeout(window.titleNotificationTimeout);
          }

          window.titleNotificationTimeout = setTimeout(() => {
            if (window.electronAPI) {
              window.electronAPI.showNotification('Google Chat', '새 메시지');
            }
          }, 2000); // 2초 딜레이로 알림 빈도 감소
        }
      }
    } catch (error) {
      // 에러 무시 (CPU 절약)
    }
  }, 10000); // 10초마다 확인
}

// 페이지 로드 완료 후 관찰자 설정
window.addEventListener('load', () => {
  setTimeout(setupTitleObserver, 2000);
});

// 언로드 시 정리
window.addEventListener('beforeunload', () => {
  if (titleCheckInterval) {
    clearInterval(titleCheckInterval);
    titleCheckInterval = null;
  }
});

// 최적화된 키보드 이벤트 핸들링
const keyboardHandler = e => {
  // 이미 처리된 이벤트는 무시
  if (e.defaultPrevented) return;

  // Cmd/Ctrl + W: 창 닫기 대신 숨기기
  if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
    e.preventDefault();
    if (window.electronAPI) {
      window.electronAPI.hideWindow();
    }
    return;
  }

  // Cmd/Ctrl + R: 새로고침
  if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
    // Shift 키가 없을 때만 기본 동작 방지
    if (!e.shiftKey) {
      e.preventDefault();
      window.location.reload();
    }
    return;
  }

  // Cmd/Ctrl + N: 새 채팅
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
    e.preventDefault();
    // 캐싱된 선택자 사용
    if (!window.newChatButton) {
      window.newChatButton = document.querySelector(
        '[aria-label*="새 채팅"], [aria-label*="New chat"], [data-tooltip*="새 채팅"], [data-tooltip*="New chat"]'
      );
    }
    if (window.newChatButton) {
      window.newChatButton.click();
    }
    return;
  }
};

// 이벤트 위임을 사용한 효율적인 이벤트 핸들링
document.addEventListener('keydown', keyboardHandler, { passive: false });

// 에러 핸들링 최적화
window.addEventListener('error', e => {
  // 반복적인 에러 로깅 방지
  if (!window.errorLog) {
    window.errorLog = new Set();
  }

  const errorKey = `${e.filename}:${e.lineno}:${e.message}`;
  if (!window.errorLog.has(errorKey)) {
    window.errorLog.add(errorKey);
    console.error('Page error:', e.error);

    // 메모리 정리
    if (window.errorLog.size > 100) {
      window.errorLog.clear();
    }
  }
});

// 언로드 시 정리
window.addEventListener('beforeunload', () => {
  console.log('Page unloading - cleaning up');

  // 관찰자 정리
  if (titleObserver) {
    titleObserver.disconnect();
    titleObserver = null;
  }

  // 타이머 정리
  if (window.titleNotificationTimeout) {
    clearTimeout(window.titleNotificationTimeout);
  }

  // 이벤트 리스너 정리
  document.removeEventListener('keydown', keyboardHandler);

  // 성능 측정 정리
  if (window.performance && window.performance.clearMarks) {
    window.performance.clearMarks();
    window.performance.clearMeasures();
  }
});

// 성능 모니터링 기능 제거 (CPU 사용량 감소)
