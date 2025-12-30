const path = require('path');

describe('Memory Management Tests', () => {
  test('timers are tracked for cleanup', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('const timers = new Set()');
    expect(mainContent).toContain('timers.add');
  });

  test('intervals are tracked for cleanup', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('const intervals = new Set()');
    expect(mainContent).toContain('intervals.add');
  });

  test('timers are cleared on window close', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('clearTimeout');
    expect(mainContent).toContain('timers.forEach');
    expect(mainContent).toContain('timers.clear()');
  });

  test('intervals are cleared on window close', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('clearInterval');
    expect(mainContent).toContain('intervals.forEach');
    expect(mainContent).toContain('intervals.clear()');
  });

  test('memory monitoring interval is tracked', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('memoryMonitorInterval');
    expect(mainContent).toContain('intervals.add(memoryMonitorInterval)');
  });

  test('memory monitoring runs every 5 minutes', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('5 * 60 * 1000');
  });

  test('memory cleanup is triggered at 85% usage', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('usedMB > limitMB * 0.85');
    expect(mainContent).toContain('requestMemoryCleanup');
  });

  test('webContents event handlers are tracked', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('_webContentsEventHandlers');
    expect(mainContent).toContain('trackWebContentsHandler');
  });

  test('event handlers are removed on cleanup', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('removeListener');
    expect(mainContent).toContain('webContentsEventHandlers.forEach');
    expect(mainContent).toContain('webContentsEventHandlers.clear()');
  });

  test('download handler is tracked and cleaned up', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('_downloadHandler');
    expect(mainContent).toContain("removeListener('will-download'");
    expect(mainContent).toContain('_downloadHandler = null');
  });

  test('weakSet is used for error logging', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).toContain('WeakSet');
    expect(preloadContent).toContain('errorLog');
  });

  test('DOM references are not cached indefinitely', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).not.toContain('window.newChatButton');
    expect(preloadContent).toContain('document.querySelector');
  });

  test('performance marks are cleared', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).toContain('clearMarks()');
    expect(preloadContent).toContain('clearMeasures()');
  });

  test('title observer is properly disconnected', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).toContain('titleObserver.disconnect()');
    expect(preloadContent).toContain('titleObserver = null');
  });

  test('global cleanup is performed on app quit', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('before-quit');
    expect(mainContent).toContain('performing global cleanup');
    expect(mainContent).toContain('removeAllListeners');
  });

  test('garbage collection is requested on high memory', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('window.gc()');
  });

  test('optimized JavaScript functions are used', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('initializeOptimizations');
    expect(mainContent).toContain('cleanupResources');
    expect(mainContent).toContain('applyStyles');
  });

  test('context menu is destroyed to prevent leaks', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('currentContextMenu.destroy()');
    expect(mainContent).toContain('currentContextMenu = null');
  });
});
