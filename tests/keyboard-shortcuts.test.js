const path = require('path');

describe('Keyboard Shortcuts Tests', () => {
  test('Cmd/Ctrl+R refreshes page', () => {
    const fs = require('fs');
    const mainContent = readMainSource();
    const preloadContent = readPreloadSource();

    expect(mainContent).toContain("accelerator: 'CmdOrCtrl+R'");
    expect(preloadContent).toContain("e.key === 'r'");
    expect(preloadContent).toContain('window.location.reload()');
  });

  test('Cmd/Ctrl+Shift+R hard refreshes', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("accelerator: 'CmdOrCtrl+Shift+R'");
    expect(mainContent).toContain('reloadIgnoringCache');
  });

  test('Cmd/Ctrl+W hides window', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain("e.key === 'w'");
    expect(preloadContent).toContain('window.electronAPI.hideWindow()');
  });

  test('Cmd/Ctrl+N opens new chat', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain("e.key === 'n'");
    expect(preloadContent).toContain('[aria-label*="새 채팅"]');
    expect(preloadContent).toContain('[aria-label*="New chat"]');
  });

  test('F12 toggles DevTools', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("accelerator: 'F12'");
    expect(mainContent).toContain('toggleDevTools');
  });

  test('Cmd/Ctrl+Q quits application', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("accelerator: 'CmdOrCtrl+Q'");
    expect(mainContent).toContain('app.isQuitting = true');
    expect(mainContent).toContain('app.quit()');
  });

  test('keyboard shortcuts handle Cmd and Ctrl keys', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain('metaKey');
    expect(preloadContent).toContain('ctrlKey');
  });

  test('keyboard event handler uses passive: false', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain('passive: false');
  });

  test('keyboard handler checks for defaultPrevented', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain('e.defaultPrevented');
  });

  test('Shift key is checked for Cmd/Ctrl+Shift+R', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain('!e.shiftKey');
  });

  test('keyboard shortcuts are cleaned up on unload', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain('removeEventListener');
    expect(preloadContent).toContain('keyboardHandler');
  });

  test('new chat button queries multiple selectors', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain('[data-tooltip*="새 채팅"]');
    expect(preloadContent).toContain('[data-tooltip*="New chat"]');
  });
});
