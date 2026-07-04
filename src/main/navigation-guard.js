// Navigation guards — extracted from main.js:95-102 (setWindowOpenHandler)
// and main.js:198-209 (will-navigate).
//
// M1 (technical review): the two predicates use DIFFERENT domain logic and
// must NOT be unified. setWindowOpenHandler matches substrings in the full URL
// (including 'google.com/chat'); will-navigate matches substrings in the
// hostname only (including bare 'google.com'). Unifying would change how
// accounts.google.com auth redirects branch.

const { shell } = require('electron');
const {
  WINDOW_OPEN_ALLOWED_SUBSTRINGS,
  NAVIGATION_ALLOWED_HOSTNAME_SUBSTRINGS
} = require('./constants');

// Pure predicate (Phase 4 unit-test target): does the full URL contain an
// allowed substring? Preserves main.js:97 .includes() substring semantics.
function isAllowedWindowOpenUrl(url) {
  return WINDOW_OPEN_ALLOWED_SUBSTRINGS.some(s => url.includes(s));
}

// Pure predicate (Phase 4 unit-test target): does the hostname contain an
// allowed substring? Preserves main.js:203-204 .includes() substring semantics.
function isAllowedNavigationHostname(hostname) {
  return NAVIGATION_ALLOWED_HOSTNAME_SUBSTRINGS.some(s => hostname.includes(s));
}

// setWindowOpenHandler: deny all new windows; route disallowed URLs to the
// system browser. Allowed URLs are still denied (no new window) — Google Chat
// runs in the single main window.
function createWindowOpenHandler() {
  return ({ url }) => {
    if (!isAllowedWindowOpenUrl(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  };
}

// will-navigate: block off-domain top-level navigations and route to the
// system browser. Preserves main.js:198-209 exactly (URL parse happens here,
// matching original which constructed new URL(navigationUrl) inline).
function createNavigationHandler() {
  return (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (!isAllowedNavigationHostname(parsedUrl.hostname)) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  };
}

module.exports = {
  isAllowedWindowOpenUrl,
  isAllowedNavigationHostname,
  createWindowOpenHandler,
  createNavigationHandler
};
