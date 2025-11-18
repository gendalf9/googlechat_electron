# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- **Current**: v1.0.4
- **Previous**: v1.0.3
- **Status**: ✅ Production Ready - All security and code quality checks pass
