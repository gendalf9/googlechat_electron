// Title observer — extracted from preload.js:86-183.
// Runs in the preload's isolated world (same context as index.js via require).
// Detects document.title changes → fires new-message notifications via the
// exposed electronAPI, with 2-second debouncing.

let titleObserver = null;
let lastTitle = '';
let titleCheckInterval = null;
let titleNotificationTimeout = null;

function setupTitleObserver() {
  if (titleObserver) {
    titleObserver.disconnect();
    titleObserver = null;
  }

  clearInterval(titleCheckInterval);
  titleCheckInterval = null;

  clearTimeout(titleNotificationTimeout);
  titleNotificationTimeout = null;

  titleObserver = new MutationObserver(_mutations => {
    try {
      const currentTitle = document.title;
      if (currentTitle !== lastTitle) {
        lastTitle = currentTitle;

        if (
          currentTitle &&
          currentTitle !== 'Google Chat' &&
          currentTitle !== 'Google Chat Desktop'
        ) {
          clearTimeout(titleNotificationTimeout);
          titleNotificationTimeout = setTimeout(() => {
            if (window.electronAPI) {
              window.electronAPI.showNotification('Google Chat', '새 메시지');
            }
          }, 2000);
        }
      }
    } catch (_error) {
      // Error ignored (preserved).
    }
  });

  const titleElement = document.querySelector('title');
  if (titleElement) {
    titleObserver.observe(titleElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  } else {
    titleObserver.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
}

function cleanupTitleObserver() {
  if (titleObserver) {
    titleObserver.disconnect();
    titleObserver = null;
  }

  clearInterval(titleCheckInterval);
  titleCheckInterval = null;

  clearTimeout(titleNotificationTimeout);
  titleNotificationTimeout = null;
}

window.addEventListener('load', () => {
  setTimeout(setupTitleObserver, 2000);
});

window.addEventListener('beforeunload', cleanupTitleObserver);

module.exports = { cleanupTitleObserver };
