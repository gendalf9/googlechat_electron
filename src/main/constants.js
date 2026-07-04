// Application constants — single source of truth.
// Extracted from main.js. UA value updated in Phase 3 (debt cleanup).

const GOOGLE_CHAT_URL = 'https://chat.google.com';
const HTTP_REFERRER = 'https://chat.google.com';

// M1 (technical review): setWindowOpenHandler and will-navigate use DIFFERENT
// domain logic. Do NOT unify — would change auth-redirect branching behavior.
// setWindowOpenHandler (main.js:97): substring match on full URL.
const WINDOW_OPEN_ALLOWED_SUBSTRINGS = ['chat.google.com', 'google.com/chat'];
// will-navigate (main.js:203-204): substring match on hostname only.
const NAVIGATION_ALLOWED_HOSTNAME_SUBSTRINGS = ['chat.google.com', 'google.com'];

// Stale as of extraction (Phase 3 updates to current Chrome stable).
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const APP_NAME = 'Google Chat Desktop';
const WINDOW_TITLE = 'Google Chat';
const TRAY_TOOLTIP = 'Google Chat Desktop';
const ASSET_ICON = 'assets/icon.png';

const WINDOW_CONFIG = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  backgroundColor: '#ffffff'
};

const MEMORY_MONITOR_INTERVAL_MS = 5 * 60 * 1000;
const MEMORY_HIGH_USAGE_RATIO = 0.85; // main-process monitor threshold
const MEMORY_CLEANUP_RATIO = 0.8; // renderer-side injection threshold

const SHOW_FALLBACK_DELAY_MS = 3000;

module.exports = {
  GOOGLE_CHAT_URL,
  HTTP_REFERRER,
  WINDOW_OPEN_ALLOWED_SUBSTRINGS,
  NAVIGATION_ALLOWED_HOSTNAME_SUBSTRINGS,
  USER_AGENT,
  APP_NAME,
  WINDOW_TITLE,
  TRAY_TOOLTIP,
  ASSET_ICON,
  WINDOW_CONFIG,
  MEMORY_MONITOR_INTERVAL_MS,
  MEMORY_HIGH_USAGE_RATIO,
  MEMORY_CLEANUP_RATIO,
  SHOW_FALLBACK_DELAY_MS
};
