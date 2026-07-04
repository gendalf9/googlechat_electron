// Keyboard shortcuts — extracted from preload.js:185-223.
// Runs in the preload's isolated world. Cmd/Ctrl+W hides, +R reloads, +N opens
// new chat. Registered via document keydown with capturing.

const keyboardHandler = e => {
  if (e.defaultPrevented) return;

  // Cmd/Ctrl + W: hide window (not close).
  if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
    e.preventDefault();
    if (window.electronAPI) {
      window.electronAPI.hideWindow();
    }
    return;
  }

  // Cmd/Ctrl + R: reload (Shift variant passes through for hard reload).
  if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
    if (!e.shiftKey) {
      e.preventDefault();
      window.location.reload();
    }
    return;
  }

  // Cmd/Ctrl + N: new chat.
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
    e.preventDefault();
    const newChatButton = document.querySelector(
      '[aria-label*="새 채팅"], [aria-label*="New chat"], [data-tooltip*="새 채팅"], [data-tooltip*="New chat"]'
    );
    if (newChatButton) {
      newChatButton.click();
    }
    return;
  }
};

document.addEventListener('keydown', keyboardHandler, { passive: false });

function cleanupKeyboard() {
  document.removeEventListener('keydown', keyboardHandler);
}

module.exports = { cleanupKeyboard };
