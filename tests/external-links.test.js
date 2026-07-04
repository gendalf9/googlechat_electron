const path = require('path');

describe('External Links Tests', () => {
  test('window open handler prevents new windows', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('setWindowOpenHandler');
    expect(mainContent).toContain("{ action: 'deny' }");
  });

  test('external links open in default browser', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('shell.openExternal');
    expect(mainContent).toContain('{ shell } = require');
  });

  test('Google Chat links are not opened externally', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('chat.google.com');
    expect(mainContent).toContain('google.com/chat');
  });

  test('will-navigate handler prevents external navigation', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('will-navigate');
    expect(mainContent).toContain('event.preventDefault()');
  });

  test('navigation handler uses URL parsing', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('new URL(navigationUrl)');
    expect(mainContent).toContain('parsedUrl.hostname');
  });

  test('only Google Chat domain is allowed for navigation', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('isAllowedNavigationHostname');
    expect(mainContent).toContain('NAVIGATION_ALLOWED_HOSTNAME_SUBSTRINGS');
  });

  test('context menu has search in Google option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '검색'");
    expect(mainContent).toContain('www.google.com/search?q=');
  });

  test('context menu has open link option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '링크 열기'");
    expect(mainContent).toContain('shell.openExternal');
  });

  test('open link option is only visible when link exists', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('params.linkURL');
    expect(mainContent).toContain("visible: params.linkURL !== ''");
  });

  test('external link API is exposed via electronAPI', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain('openExternal');
    expect(preloadContent).toContain("ipcRenderer.send('open-external'");
  });

  test('IPC handler for external links exists', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("ipcMain.on('open-external'");
    expect(mainContent).toContain('shell.openExternal(url)');
  });

  test('Google Chat attachment URLs are handled specially', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('get_attachment_url');
    expect(mainContent).toContain('chat.google.com');
  });

  test('context menu click handler is implemented', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('click: () => {');
    expect(mainContent).toContain('selectedText');
  });

  test('search option uses encodeURIComponent', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('encodeURIComponent');
  });
});
