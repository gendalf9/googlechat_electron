const path = require('path');

describe('Application Menu Tests', () => {
  test('menu creation function exists', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('createMenu');
    expect(mainContent).toContain('Menu.buildFromTemplate');
  });

  test('File menu exists', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '파일'");
  });

  test('File menu has refresh option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '새로고침'");
    expect(mainContent).toContain("accelerator: 'CmdOrCtrl+R'");
  });

  test('File menu has hard refresh option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '강제 새로고침'");
    expect(mainContent).toContain("accelerator: 'CmdOrCtrl+Shift+R'");
  });

  test('File menu has quit option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '종료'");
    expect(mainContent).toContain("accelerator: 'CmdOrCtrl+Q'");
  });

  test('Edit menu exists', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '편집'");
  });

  test('Edit menu has undo/redo options', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("role: 'undo'");
    expect(mainContent).toContain("role: 'redo'");
  });

  test('Edit menu has edit operations', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("role: 'cut'");
    expect(mainContent).toContain("role: 'copy'");
    expect(mainContent).toContain("role: 'paste'");
    expect(mainContent).toContain("role: 'selectall'");
  });

  test('View menu exists', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '보기'");
  });

  test('View menu has zoom options', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("role: 'resetzoom'");
    expect(mainContent).toContain("role: 'zoomin'");
    expect(mainContent).toContain("role: 'zoomout'");
  });

  test('View menu has fullscreen option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("role: 'togglefullscreen'");
  });

  test('Window menu exists', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '창'");
  });

  test('Window menu has minimize option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("role: 'minimize'");
    expect(mainContent).toContain("role: 'close'");
  });

  test('Help menu exists', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '도움말'");
  });

  test('Help menu has about option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '정보'");
    expect(mainContent).toContain('showMessageBox');
  });

  test('About dialog shows version info', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('app.getVersion()');
    expect(mainContent).toContain('Google Chat Desktop');
  });

  test('menu is set as application menu', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('Menu.setApplicationMenu');
  });

  test('menu uses getWindow helper', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('getLiveWindow');
    expect(mainContent).toContain('BrowserWindow.getAllWindows()');
  });

  test('DevTools option only shows in development', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("process.env.NODE_ENV === 'development'");
    expect(mainContent).toContain('개발자 도구');
  });

  test('menu labels are in Korean', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '실행 취소'");
    expect(mainContent).toContain("label: '다시 실행'");
    expect(mainContent).toContain("label: '잘라내기'");
    expect(mainContent).toContain("label: '복사'");
    expect(mainContent).toContain("label: '붙여넣기'");
    expect(mainContent).toContain("label: '전체 선택'");
  });
});
