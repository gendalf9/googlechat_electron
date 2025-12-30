const path = require('path');

describe('Window Management Tests', () => {
  test('main.js has window creation function', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('createWindow');
    expect(mainContent).toContain('new BrowserWindow');
  });

  test('window has correct initial dimensions', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('width: 1200');
    expect(mainContent).toContain('height: 800');
    expect(mainContent).toContain('minWidth: 800');
    expect(mainContent).toContain('minHeight: 600');
  });

  test('window has correct background color', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("backgroundColor: '#ffffff'");
  });

  test('window show behavior is correct', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('show: true');
    expect(mainContent).toContain('ready-to-show');
    expect(mainContent).toContain('mainWindow.show()');
  });

  test('window hide on close instead of quit', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("on('close'");
    expect(mainContent).toContain('event.preventDefault()');
    expect(mainContent).toContain('mainWindow.hide()');
    expect(mainContent).toContain('app.isQuitting');
  });

  test('window focus handling is implemented', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('mainWindow.focus()');
    expect(mainContent).toContain('app.focus()');
  });

  test('window has proper title', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("title: 'Google Chat'");
  });

  test('window has custom user agent for Google Chat', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('userAgent');
    expect(mainContent).toContain('Chrome/120.0.0.0');
  });

  test('window cleanup is properly implemented', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('cleanupWindow');
    expect(mainContent).toContain('removeAllListeners');
    expect(mainContent).toContain('mainWindow = null');
  });

  test('window has proper icon', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('icon');
    expect(mainContent).toContain('assets/icon.png');
  });

  test('window has correct web security settings', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('nodeIntegration: false');
    expect(mainContent).toContain('contextIsolation: true');
    expect(mainContent).toContain('webSecurity: true');
  });

  test('window has performance optimizations', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('paintWhenInitiallyHidden: false');
    expect(mainContent).toContain('backgroundThrottling: true');
    expect(mainContent).toContain('webgl: false');
    expect(mainContent).toContain('spellcheck: false');
  });

  test('loading screen is implemented', () => {
    const fs = require('fs');
    const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

    expect(htmlContent).toContain('<div id="loading">');
    expect(htmlContent).toContain('.spinner');
    expect(htmlContent).toContain('Google Chat을 로드하는 중...');
  });

  test('error handling for loading is implemented', () => {
    const fs = require('fs');
    const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

    expect(htmlContent).toContain('<div id="error-message">');
    expect(htmlContent).toContain('다시 시도');
    expect(htmlContent).toContain('retryLoading');
  });
});
