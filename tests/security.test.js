const path = require('path');

describe('Security Tests', () => {
  test('context isolation is enabled', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('contextIsolation: true');
  });

  test('node integration is disabled', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('nodeIntegration: false');
  });

  test('web security is enabled', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('webSecurity: true');
  });

  test('insecure content is not allowed', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('allowRunningInsecureContent: false');
  });

  test('experimental features are disabled', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('experimentalFeatures: false');
    expect(mainContent).toContain('enableBlinkFeatures: false');
  });

  test('remote module is disabled', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('enableRemoteModule: false');
  });

  test('contextBridge is used for secure IPC', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain('contextBridge');
    expect(preloadContent).toContain('exposeInMainWorld');
    expect(preloadContent).toContain('electronAPI');
  });

  test('only specific API functions are exposed', () => {
    const fs = require('fs');
    const preloadContent = readPreloadSource();

    expect(preloadContent).toContain('showNotification');
    expect(preloadContent).toContain('hideWindow');
    expect(preloadContent).toContain('openExternal');
    expect(preloadContent).toContain('downloadFile');
    expect(preloadContent).toContain('getAppVersion');
    expect(preloadContent).toContain('getPlatform');
    expect(preloadContent).toContain('getPerformanceInfo');
  });

  test('external links are handled securely', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('setWindowOpenHandler');
    expect(mainContent).toContain('shell.openExternal');
    expect(mainContent).toContain("{ action: 'deny' }");
  });

  test('only Google Chat domain is allowed for navigation', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('chat.google.com');
    expect(mainContent).toContain('google.com');
    expect(mainContent).toContain('event.preventDefault()');
  });

  test('will-navigate handler prevents external navigation', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('will-navigate');
    expect(mainContent).toContain('parsedUrl.hostname');
  });

  test('IPC handlers use proper event patterns', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("ipcMain.on('show-notification'");
    expect(mainContent).toContain("ipcMain.on('hide-window'");
    expect(mainContent).toContain("ipcMain.on('open-external'");
    expect(mainContent).toContain('ipcMain.handle');
  });

  test('custom user agent is used for compatibility', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('userAgent');
    expect(mainContent).toContain('Mozilla/5.0');
    expect(mainContent).toContain('Chrome/120.0.0.0');
  });

  test('download handler checks URL security', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('chat.google.com');
    expect(mainContent).toContain('get_attachment_url');
  });

  test('context menu limits dangerous operations', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('context-menu');
    expect(mainContent).toContain('event.preventDefault()');
  });

  test('webGL and webAudio are disabled for security', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('webgl: false');
    expect(mainContent).toContain('webaudio: false');
  });
});
