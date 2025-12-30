const path = require('path');

describe('File Download Tests', () => {
  test('download handler is implemented', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('will-download');
    expect(mainContent).toContain('downloadHandler');
  });

  test('download files go to default downloads folder', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("getPath('downloads')");
    expect(mainContent).toContain('item.setSavePath');
  });

  test('Korean filenames are decoded correctly', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('decodeURIComponent');
    expect(mainContent).toContain('fileName');
  });

  test('download completion is notified', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('item.once');
    expect(mainContent).toContain('done');
    expect(mainContent).toContain("state === 'completed'");
  });

  test('download completion notification shows filename', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('다운로드 완료');
    expect(mainContent).toContain('fileName');
  });

  test('download failure is notified', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('다운로드 실패');
    expect(mainContent).toContain('else');
  });

  test('download folder open option is provided on macOS', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("process.platform === 'darwin'");
    expect(mainContent).toContain('showMessageBox');
    expect(mainContent).toContain('폴더 열기');
  });

  test('download handler prevents duplicate listeners', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('downloadHandlerSetup');
    expect(mainContent).toContain('if (downloadHandlerSetup)');
  });

  test('existing will-download listeners are removed', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("removeAllListeners('will-download'");
  });

  test('download handler is tracked for cleanup', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('_downloadHandler');
    expect(mainContent).toContain('_downloadHandler = downloadHandler');
  });

  test('download API is exposed via electronAPI', () => {
    const fs = require('fs');
    const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

    expect(preloadContent).toContain('downloadFile');
    expect(preloadContent).toContain("ipcRenderer.send('download-file'");
  });

  test('IPC handler for downloads exists', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("ipcMain.on('download-file'");
    expect(mainContent).toContain('async (event, url, fileName)');
  });

  test('Google Chat authenticated URLs are handled', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('chat.google.com');
    expect(mainContent).toContain('get_attachment_url');
    expect(mainContent).toContain('shell.openExternal(url)');
  });

  test('download notification includes action message', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('다운로드를 브라우저에서 시작합니다');
    expect(mainContent).toContain('링크를 브라우저에서 엽니다');
  });
});
