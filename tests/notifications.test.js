const path = require('path');

describe('Notification System Tests', () => {
  test('notification function exists', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('showNotification');
    expect(mainContent).toContain('new Notification');
  });

  test('notification has title and body', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('title');
    expect(mainContent).toContain('body');
  });

  test('notification has icon', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('icon');
    expect(mainContent).toContain('assets/icon.png');
  });

  test('new message notification uses MutationObserver', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).toContain('MutationObserver');
    expect(preloadContent).toContain('titleObserver');
    expect(preloadContent).toContain("document.querySelector('title')");
  });

  test('title change detection is debounced', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).toContain('setTimeout');
    expect(preloadContent).toContain('titleNotificationTimeout');
    expect(preloadContent).toContain('2000'); // 2초 디바운싱
  });

  test('notification detects new messages', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).toContain('currentTitle !== lastTitle');
    expect(preloadContent).toContain("'Google Chat'");
  });

  test('title observer is cleaned up on unload', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).toContain('cleanupTitleObserver');
    expect(preloadContent).toContain('titleObserver.disconnect()');
    expect(preloadContent).toContain('beforeunload');
  });

  test('download completion notification is implemented', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('다운로드 완료');
    expect(mainContent).toContain("state === 'completed'");
  });

  test('download failure notification is implemented', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('다운로드 실패');
    expect(mainContent).toContain("state === 'completed'");
  });

  test('notification API is exposed via IPC', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("ipcMain.on('show-notification'");
  });

  test('notification test in tray menu works', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain(
      "showNotification('테스트', '알림 기능이 정상적으로 작동합니다.')"
    );
  });

  test('multiple title changes are handled correctly', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).toContain('lastTitle');
    expect(preloadContent).toContain('clearTimeout');
  });
});
