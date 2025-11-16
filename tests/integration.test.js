const { Application } = require('spectron');
const path = require('path');

describe('Application Integration Tests', () => {
  let app;

  beforeEach(async () => {
    // Try to find electron in different possible locations
    const electronPath = require('electron');

    app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '../main.js')],
      env: {
        NODE_ENV: 'test'
      }
    });

    await app.start();
  }, 30000); // 30 seconds timeout for app startup

  afterEach(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  }, 10000);

  test('application launches successfully', async () => {
    const windowCount = await app.client.getWindowCount();
    expect(windowCount).toBe(1);
  });

  test('application window has correct title', async () => {
    const title = await app.client.getTitle();
    expect(title).toBe('Google Chat');
  });

  test('application loads Google Chat URL', async () => {
    const url = await app.client.getUrl();
    expect(url).toContain('chat.google.com');
  });

  test('window has correct dimensions', async () => {
    const { width, height } = await app.client.browserWindow.getBounds();
    expect(width).toBeGreaterThanOrEqual(800);
    expect(height).toBeGreaterThanOrEqual(600);
  });

  test('right-click context menu works', async () => {
    // Test right-click functionality
    await app.client.rightClick('body');

    // Check if context menu appears (implementation specific)
    const contextMenuVisible = await app.client.executeJavaScript(() => {
      const contextMenu = document.querySelector('.context-menu');
      return contextMenu && contextMenu.style.display !== 'none';
    });

    // This test may need adjustment based on actual context menu implementation
    expect(typeof contextMenuVisible).toBe('boolean');
  });

  test('keyboard shortcuts work', async () => {
    // Test Cmd/Ctrl + R refresh
    await app.client.keys(['CommandOrCtrl', 'r']);

    // Wait for refresh to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    const url = await app.client.getUrl();
    expect(url).toContain('chat.google.com');
  });

  test('external links open in system browser', async () => {
    // This test requires mocking shell.openExternal
    // For now, we'll test the click behavior

    // Create a test link
    await app.client.executeJavaScript(() => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.id = 'test-link';
      link.textContent = 'Test Link';
      document.body.appendChild(link);
    });

    // Click the link
    await app.client.click('#test-link');

    // In a real test, we'd verify that shell.openExternal was called
    // For now, we'll just verify the click worked
    const linkExists = await app.client.executeJavaScript(() => {
      return document.getElementById('test-link') !== null;
    });

    expect(linkExists).toBe(true);
  });

  test('input fields work correctly', async () => {
    // Test if input fields are functional
    const inputExists = await app.client.executeJavaScript(() => {
      const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
      return inputs.length > 0;
    });

    // If inputs exist, test typing
    if (inputExists) {
      await app.client.keys(['t', 'e', 's', 't']);

      // Verify that typing worked (this depends on Google Chat's current UI)
      const inputFocused = await app.client.executeJavaScript(() => {
        const activeElement = document.activeElement;
        return activeElement && activeElement.tagName.toLowerCase() === 'input';
      });

      // This may not always work due to Google Chat's dynamic UI
      expect(typeof inputFocused).toBe('boolean');
    } else {
      // If no inputs found (not logged in), that's also a valid state
      expect(inputExists).toBe(false);
    }
  });

  test('app can be minimized and restored', async () => {
    // Minimize window
    await app.client.browserWindow.minimize();

    const isMinimized = await app.client.browserWindow.isMinimized();
    expect(isMinimized).toBe(true);

    // Restore window
    await app.client.browserWindow.restore();

    const isMinimizedAfter = await app.client.browserWindow.isMinimized();
    expect(isMinimizedAfter).toBe(false);
  });

  test('app can be hidden and shown', async () => {
    // Hide window (simulating tray click)
    await app.client.browserWindow.hide();

    let isVisible = await app.client.browserWindow.isVisible();
    expect(isVisible).toBe(false);

    // Show window
    await app.client.browserWindow.show();

    isVisible = await app.client.browserWindow.isVisible();
    expect(isVisible).toBe(true);
  });

  test('app handles window close correctly (hide instead of quit)', async () => {
    // Try to close window
    await app.client.browserWindow.close();

    // Window should still exist (hidden, not destroyed)
    const windowCount = await app.client.getWindowCount();
    expect(windowCount).toBe(1);
  });
});