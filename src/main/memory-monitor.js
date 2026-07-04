// Memory monitor — extracted from main.js:699-738.
//
// M5 (technical review): start timing changes from module-load (synchronous
// setInterval at require time) to app.whenReady (called from index.js).
// Equivalent in the normal case (whenReady < 5 min); safer if whenReady is
// delayed or fails (interval never created). Documented as a non-behavior
// improvement.

const { trackInterval } = require('./timers');
const { MEMORY_MONITOR_INTERVAL_MS, MEMORY_HIGH_USAGE_RATIO } = require('./constants');

// Starts the 5-minute memory monitor. Returns the tracked interval.
// getMainWindow is a getter (null-safe) supplied by index.js.
function startMemoryMonitor(getMainWindow) {
  return trackInterval(async () => {
    const mainWindow = getMainWindow();
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    try {
      const memInfo = await mainWindow.webContents.executeJavaScript(
        'window.electronAPI && window.electronAPI.getPerformanceInfo()'
      );

      if (!memInfo || !memInfo.memory) {
        return;
      }

      const usedMB = Math.round(memInfo.memory.usedJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memInfo.memory.jsHeapSizeLimit / 1024 / 1024);

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Memory Usage: ${usedMB}MB / ${limitMB}MB (${Math.round((usedMB / limitMB) * 100)}%)`
        );
      }

      if (usedMB > limitMB * MEMORY_HIGH_USAGE_RATIO) {
        console.log('High memory usage detected, triggering cleanup...');
        try {
          await mainWindow.webContents.executeJavaScript(
            'window.electronAPI && window.electronAPI.requestMemoryCleanup()'
          );
        } catch (cleanupError) {
          console.error('Memory cleanup failed:', cleanupError);
        }
      }
    } catch (error) {
      console.debug('Memory monitor check failed:', error.message);
    }
  }, MEMORY_MONITOR_INTERVAL_MS);
}

module.exports = { startMemoryMonitor };
