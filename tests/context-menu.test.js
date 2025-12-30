const path = require('path');

describe('Context Menu Tests', () => {
  test('context menu handler is implemented', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('context-menu');
    expect(mainContent).toContain('contextMenuHandler');
  });

  test('context menu has basic editing operations', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("role: 'cut'");
    expect(mainContent).toContain("role: 'copy'");
    expect(mainContent).toContain("role: 'paste'");
    expect(mainContent).toContain("role: 'selectAll'");
  });

  test('context menu has Korean labels', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("label: '잘라내기'");
    expect(mainContent).toContain("label: '복사'");
    expect(mainContent).toContain("label: '붙여넣기'");
    expect(mainContent).toContain("label: '전체 선택'");
  });

  test('context menu has separator items', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("type: 'separator'");
  });

  test('context menu has search option', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("label: '검색'");
    expect(mainContent).toContain('www.google.com/search?q=');
  });

  test('search option uses selected text', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('params.selectionText');
    expect(mainContent).toContain('encodeURIComponent');
  });

  test('context menu has open link option', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("label: '링크 열기'");
    expect(mainContent).toContain('params.linkURL');
  });

  test('open link option is conditional', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("visible: params.linkURL !== ''");
  });

  test('context menu prevents default browser menu', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('event.preventDefault()');
  });

  test('context menu is destroyed on close', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('currentContextMenu.destroy()');
    expect(mainContent).toContain('currentContextMenu = null');
  });

  test('context menu cleanup is tracked', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('menu-will-close');
    expect(mainContent).toContain('setTimeout');
  });

  test('context menu uses 1 second delay for cleanup', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('1000'); // 1초 딜레이
  });

  test('context menu cleanup is called on window close', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain("on('closed'");
    expect(mainContent).toContain('currentContextMenu.destroy()');
  });

  test('context menu is built from template', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('Menu.buildFromTemplate');
    expect(mainContent).toContain('contextMenuTemplate');
  });

  test('context menu is popped up correctly', () => {
    const fs = require('fs');
    const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

    expect(mainContent).toContain('currentContextMenu.popup()');
  });
});
