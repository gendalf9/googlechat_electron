// Context menu handler factory — extracted from main.js:213-278.
// Returns { handler, destroy } so window.js can wire the context-menu event
// and the window 'closed' cleanup separately. Preserves the
// currentContextMenu accumulation fix (#2) and the 1-second menu-will-close
// auto-cleanup delay.

const { Menu, shell } = require('electron');

function createContextMenuHandler() {
  let currentContextMenu = null;

  const destroy = () => {
    if (currentContextMenu) {
      currentContextMenu.destroy();
      currentContextMenu = null;
    }
  };

  const handler = (event, params) => {
    event.preventDefault();

    // Critical Memory Leak Fix #2: destroy previous context menu.
    destroy();

    const contextMenuTemplate = [
      { role: 'cut', label: '잘라내기' },
      { role: 'copy', label: '복사' },
      { role: 'paste', label: '붙여넣기' }, // n3: known typo preserved ('붙여넣' in original main.js:585 is in the app menu, not here)
      { type: 'separator' },
      { role: 'selectAll', label: '전체 선택' },
      { type: 'separator' },
      {
        label: '검색',
        click: () => {
          const selectedText = params.selectionText;
          if (selectedText) {
            shell.openExternal(
              `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`
            );
          }
        }
      },
      {
        label: '링크 열기',
        click: () => {
          if (params.linkURL) {
            shell.openExternal(params.linkURL);
          }
        },
        visible: params.linkURL !== ''
      }
    ];

    currentContextMenu = Menu.buildFromTemplate(contextMenuTemplate);

    // Auto-cleanup after menu closes (1s delay to allow interactions).
    currentContextMenu.once('menu-will-close', () => {
      setTimeout(() => {
        if (currentContextMenu) {
          currentContextMenu.destroy();
          currentContextMenu = null;
        }
      }, 1000);
    });

    currentContextMenu.popup();
  };

  return { handler, destroy };
}

module.exports = { createContextMenuHandler };
