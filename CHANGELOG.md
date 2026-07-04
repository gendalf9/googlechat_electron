# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.1.0] - 2026-07-04

### Changed

- **Architecture**: Modularized monolithic `main.js` (832 lines) and `preload.js`
  (461 lines) into a layered structure under `src/main/` and `src/preload/`.
  Entry moved to `src/main/index.js`; clean cutover (no shims).
- **User Agent**: Updated stale Chrome/120 to Chrome/138 for Google Chat
  compatibility.
- **Navigation guards preserved**: `setWindowOpenHandler` and `will-navigate`
  kept as separate predicates with different domain logic (unifying would
  change auth-redirect behavior).
- **CommonJS retained** (no ESM migration).

### Fixed

- **getAppVersion bug**: preload `getAppVersion` always returned `'1.0.0'`
  (env var never set); now queries the main process via `sendSync`.
- **Menu version string**: hardcoded "Version 1.0.8" replaced with
  `app.getVersion()`.
- **Dependencies**: removed unused `@tauri-apps/cli`; aligned
  `jest-environment-jsdom` to `^29.7.0` (matches jest 29.7); restored
  `js-yaml` override at the fixed `^4.1.2` (the vulnerable `^4.1.1` was
  re-exposed when removed).
- **CI**: removed dead `update-dependencies` job (no schedule trigger);
  bumped `codecov-action` v3→v5 and `action-gh-release` v1→v2; Linux
  release artifacts reduced to AppImage only.
- **Cruft**: removed `.env.example` (dotenv unused) and `.taskmaster/`;
  deduplicated `.gitignore`.

### Added

- **Behavior unit tests**: 17 high-signal tests for extracted pure functions
  (navigation predicates incl. the M1 asymmetry, filename decode, UA format,
  timers bookkeeping). Total 234 tests pass.

### Notes

- Manual GUI smoke and packaged-app launch verification deferred: the
  Electron binary does not install under this dev environment's
  allow-scripts policy. Verify on first packaged build.
- Remaining `npm audit` findings (19) are pre-existing in the pinned
  Electron 39.2 and the electron-builder transitive tree; out of scope for
  this refactor.

## [1.0.8] - 2025-12-29

### Fixed

- **Memory Management**: Enhanced memory leak prevention
  - Changed error logging from Set to WeakSet for automatic memory cleanup
  - Removed DOM element caching (window.newChatButton) to prevent reference leaks
  - Added safety checks before executeJavaScript calls
  - Improved error handling in memory monitoring
  - Removed unused errorKey variable in error handler

### Added

- **Test Coverage**: Expanded test suite from 38 to 183 tests (5x increase)
  - Added window-management.test.js (14 tests)
  - Added system-tray.test.js (10 tests)
  - Added notifications.test.js (12 tests)
  - Added keyboard-shortcuts.test.js (12 tests)
  - Added security.test.js (16 tests)
  - Added memory-management.test.js (18 tests)
  - Added external-links.test.js (14 tests)
  - Added downloads.test.js (14 tests)
  - Added context-menu.test.js (15 tests)
  - Added application-menu.test.js (19 tests)
  - All tests pass (183/183, 100% success rate)

### Changed

- **Documentation**: Created comprehensive Product Requirements Document (PRD)
  - Complete product overview and target user definitions
  - Detailed feature requirements for all core functionalities
  - Performance and optimization requirements
  - Security requirements and best practices
  - Platform-specific build configurations
  - Development and build requirements
  - Test requirements and success metrics

### Technical Details

- **Memory Optimization**:
  - WeakSet usage eliminates manual error log cleanup
  - DOM queries executed on demand instead of caching
  - executeJavaScript now checks for electronAPI existence before execution
  - Memory monitoring improved with try-catch blocks

- **Test Coverage**:
  - PRD-based comprehensive test coverage
  - All major features tested
  - Memory management tests verify cleanup procedures
  - Security tests validate Electron best practices
  - Performance tests ensure efficiency

## [1.0.4] - 2025-11-18

### Changed

- **Production Ready**: Removed DevTools from production mode for clean user experience
  - DevTools now only available in development mode (NODE_ENV=development)
  - Removed automatic DevTools opening on app start
  - Removed DevTools menu item and F12 shortcut from production builds
  - Updated app version info to show "Production Ready"

### Technical Details

- Conditional DevTools rendering using NODE_ENV environment variable
- Clean production build without development tools
- Better user experience for end users

## [1.0.3] - 2025-11-18

### Fixed

- **Security**: Resolved all 14 high severity vulnerabilities
  - Updated dependencies to fix glob security issues
  - Downgraded jest from 30.2.0 to 29.7.0 to address security vulnerabilities
  - Now 0 vulnerabilities found
- **Code Quality**: Fixed Prettier formatting issues in main.js
  - Applied consistent code formatting across the project
  - GitHub Actions code quality checks now pass

### Changed

- Updated package.json version to match release tag (1.0.3)

## [1.0.2] - 2025-11-18

### Added

- **Image Download**: Implemented Google Chat image download functionality
  - Added comprehensive download handling for Google Chat attachments
  - Implemented JavaScript injection to detect download buttons with `get_attachment_url`
  - Added IPC communication between renderer and main processes
  - Uses external browser for authenticated downloads instead of direct Electron downloads
  - Includes proper file naming with content type detection
  - Added user notifications for download feedback

### Technical Details

- **main.js**: Added download file handler and will-download event listener
- **preload.js**: Exposed downloadFile API via contextBridge
- **Security**: Maintains secure IPC communication patterns

## [1.0.1] - Previous Release

### Features

- Electron-based desktop app wrapper for Google Chat
- System tray integration
- Native notifications
- Cross-platform support (macOS, Windows, Linux)
- Performance optimizations
- Security-first design with sandboxing

---

### Version Information

- **Current**: v1.0.8
- **Previous**: v1.0.7
- **Status**: ✅ Production Ready - All security and code quality checks pass
