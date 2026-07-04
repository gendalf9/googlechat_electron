// Preload entry — extracted from preload.js:1-84 (contextBridge + perf marks)
// and 237-258 (combined beforeunload cleanup). Requires title-observer,
// keyboard, and error-handler so their listeners register on preload load.
//
// contextBridge API (8 methods) signatures UNCHANGED — API Surface Parity.
// getAppVersion return value changes in Phase 3 (bug fix: '1.0.0' → real).

const { contextBridge, ipcRenderer } = require('electron');

// Side-effectful registration of renderer listeners.
require('./title-observer');
require('./keyboard');
const { cleanupErrorHandler } = require('./error-handler');
const { cleanupTitleObserver } = require('./title-observer');
const { cleanupKeyboard } = require('./keyboard');
contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) => ipcRenderer.send('show-notification', title, body),
  hideWindow: () => ipcRenderer.send('hide-window'),

  openExternal: url => ipcRenderer.send('open-external', url),

  downloadFile: (url, fileName) => ipcRenderer.send('download-file', url, fileName),

  getAppVersion: () => ipcRenderer.sendSync('get-app-version'),

  getPlatform: () => process.platform,

  getPerformanceInfo: () => {
    if (window.performance && window.performance.memory) {
      return {
        memory: window.performance.memory,
        timing: window.performance.timing,
        timestamp: Date.now()
      };
    }
    return null;
  },

  requestMemoryCleanup: () => {
    if (window.gc) {
      window.gc();
    }

    const unusedElements = document.querySelectorAll('.unused-element');
    unusedElements.forEach(element => {
      element.remove();
    });

    return {
      cleaned: unusedElements.length,
      timestamp: Date.now()
    };
  }
});

function cleanupUnusedListeners() {
  const unusedElements = document.querySelectorAll('.unused-element');
  unusedElements.forEach(element => {
    element.replaceWith(element.cloneNode(true));
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.performance && window.performance.mark) {
    window.performance.mark('app-start');
  }

  setTimeout(() => {
    cleanupUnusedListeners();

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

const cleanupEverything = () => {
  console.log('Page unloading - performing comprehensive cleanup');

  cleanupTitleObserver();
  cleanupErrorHandler();
  cleanupKeyboard();

  if (window.performance && window.performance.clearMarks) {
    window.performance.clearMarks();
    window.performance.clearMeasures();
  }
};

window.addEventListener('beforeunload', cleanupEverything);
