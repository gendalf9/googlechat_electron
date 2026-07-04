const path = require('path');

describe('System Tray Tests', () => {
  test('system tray creation is implemented', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('createTray');
    expect(mainContent).toContain('new Tray');
  });

  test('tray has proper tooltip', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('setToolTip');
    expect(mainContent).toContain('Google Chat Desktop');
  });

  test('tray has context menu', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('setContextMenu');
    expect(mainContent).toContain('Menu.buildFromTemplate');
  });

  test('tray menu has open option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: 'Google Chat 열기'");
  });

  test('tray menu has keyboard shortcut', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("accelerator: 'CmdOrCtrl+Shift+G'");
  });

  test('tray menu has notification test option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '알림 테스트'");
  });

  test('tray menu has quit option', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("label: '종료'");
    expect(mainContent).toContain("accelerator: 'CmdOrCtrl+Q'");
  });

  test('tray click toggles window visibility', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain("tray.on('click'");
    expect(mainContent).toContain('win.isVisible()');
    expect(mainContent).toContain('win.show()');
    expect(mainContent).toContain('win.hide()');
  });

  test('tray creates window if none exists', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('createWindow()');
  });

  test('tray is cleaned up on app quit', () => {
    const fs = require('fs');
    const mainContent = readMainSource();

    expect(mainContent).toContain('before-quit');
    expect(mainContent).toContain('tray.destroy()');
    expect(mainContent).toContain('tray = null');
  });
});
