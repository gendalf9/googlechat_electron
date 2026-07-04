// Behavior unit tests for extracted pure logic (F5 — high-signal, not snippet).
// These EXECUTE the real functions, unlike the text-presence snippet tests.
// Covers the M1 navigation asymmetry, filename decode, UA format, timers.

// Mock electron — the extracted modules require it at top level.
jest.mock('electron', () => ({
  shell: { openExternal: jest.fn(), openPath: jest.fn() },
  app: { getPath: jest.fn(() => '/tmp/downloads'), getVersion: jest.fn(() => '1.1.0') },
  Notification: jest.fn(() => ({ show: jest.fn() })),
  dialog: { showMessageBox: jest.fn() },
  ipcMain: { on: jest.fn(), handle: jest.fn() },
  Menu: { buildFromTemplate: jest.fn() },
  Tray: jest.fn(),
  BrowserWindow: { getAllWindows: jest.fn(() => []) }
}));

const {
  isAllowedWindowOpenUrl,
  isAllowedNavigationHostname
} = require('../src/main/navigation-guard');
const { decodeFilename } = require('../src/main/session-download-handler');
const { USER_AGENT } = require('../src/main/constants');
const {
  trackTimer,
  trackInterval,
  clearAllTimers,
  clearAllIntervals,
  timers,
  intervals
} = require('../src/main/timers');

describe('navigation-guard: isAllowedWindowOpenUrl (substring on full URL)', () => {
  test('allows chat.google.com URL', () => {
    expect(isAllowedWindowOpenUrl('https://chat.google.com/room')).toBe(true);
  });

  test('allows google.com/chat URL', () => {
    expect(isAllowedWindowOpenUrl('https://google.com/chat/foo')).toBe(true);
  });

  test('rejects accounts.google.com (M1: NOT in window-open allow list)', () => {
    expect(isAllowedWindowOpenUrl('https://accounts.google.com/login')).toBe(false);
  });

  test('rejects external domain', () => {
    expect(isAllowedWindowOpenUrl('https://example.com/')).toBe(false);
  });
});

describe('navigation-guard: isAllowedNavigationHostname (substring on hostname)', () => {
  test('allows chat.google.com hostname', () => {
    expect(isAllowedNavigationHostname('chat.google.com')).toBe(true);
  });

  test('allows bare google.com hostname', () => {
    expect(isAllowedNavigationHostname('google.com')).toBe(true);
  });

  test('allows accounts.google.com (M1: hostname IS in navigation allow list)', () => {
    expect(isAllowedNavigationHostname('accounts.google.com')).toBe(true);
  });

  test('rejects external hostname', () => {
    expect(isAllowedNavigationHostname('example.com')).toBe(false);
  });
});

describe('navigation-guard: M1 asymmetry (window-open vs navigation)', () => {
  // The KEY test: the same URL branches differently in the two handlers.
  // Unifying them would change auth-redirect behavior. Preserved intentionally.
  test('accounts.google.com: window-open rejects, navigation allows', () => {
    expect(isAllowedWindowOpenUrl('https://accounts.google.com/')).toBe(false);
    expect(isAllowedNavigationHostname('accounts.google.com')).toBe(true);
  });
});

describe('session-download-handler: decodeFilename', () => {
  test('decodes valid URI-encoded filename', () => {
    expect(decodeFilename('%ED%95%9C%EA%B5%AD%EC%96%B4.txt')).toBe('한국어.txt');
  });

  test('passes through non-encoded filename', () => {
    expect(decodeFilename('document.pdf')).toBe('document.pdf');
  });

  test('falls back to original on malformed URI (catch branch)', () => {
    // %ED alone is invalid UTF-8 — decodeURIComponent throws.
    expect(decodeFilename('bad%EDfilename.zip')).toBe('bad%EDfilename.zip');
  });
});

describe('constants: USER_AGENT format', () => {
  test('matches Chrome UA pattern', () => {
    expect(USER_AGENT).toMatch(/Mozilla\/5\.0.*AppleWebKit\/537\.36.*Chrome\/\d+\.\d+\.\d+\.\d+.*Safari\/537\.36/);
  });

  test('uses a current Chrome major version (>= 138)', () => {
    const match = USER_AGENT.match(/Chrome\/(\d+)\./);
    expect(match).not.toBeNull();
    expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(138);
  });
});

describe('timers: bookkeeping over the singleton Sets', () => {
  afterEach(() => {
    clearAllTimers();
    clearAllIntervals();
  });

  test('trackTimer adds to the timers Set', () => {
    const before = timers.size;
    trackTimer(() => {}, 10000);
    expect(timers.size).toBe(before + 1);
  });

  test('trackInterval adds to the intervals Set', () => {
    const before = intervals.size;
    trackInterval(() => {}, 10000);
    expect(intervals.size).toBe(before + 1);
  });

  test('clearAllTimers empties the timers Set', () => {
    trackTimer(() => {}, 10000);
    trackTimer(() => {}, 10000);
    clearAllTimers();
    expect(timers.size).toBe(0);
  });
});
