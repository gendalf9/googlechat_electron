# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron-based desktop application wrapper for Google Chat web application. The app provides a native desktop experience for Google Chat with features like system tray integration, notifications, and performance optimizations.

## Development Commands

```bash
# Development
npm start                    # Run the application
npm run dev                 # Run in development mode (includes DevTools)

# Building
npm run build               # Build for all platforms
npm run build:mac           # Build for macOS only
npm run build:win           # Build for Windows only
npm run build:linux         # Build for Linux only
npm run pack                # Build without creating installer (for testing)

# Dependencies
npm install                 # Install dependencies
```

## Application Architecture

### Core Files Structure
- **main.js** - Main Electron process handling window management, system tray, menus, and native OS integration
- **preload.js** - Preload script providing secure IPC bridge between main and renderer processes
- **index.html** - Loading screen and fallback UI (Google Chat is loaded directly in main.js via BrowserWindow)
- **package.json** - Project configuration and electron-builder build settings
- **assets/icon.png** - Application icon

### Key Architecture Patterns

**Security-First Design:**
- Uses `contextIsolation: true` and `nodeIntegration: false`
- Implements secure IPC communication via `contextBridge`
- Sandboxed renderer process for security

**Performance Optimizations:**
- Memory management with cleanup routines
- Performance monitoring in development mode
- Optimized event handling with debouncing
- GPU acceleration for UI elements

**Cross-Platform Support:**
- Platform-specific keyboard shortcuts (Cmd/Ctrl)
- Native system tray integration
- Build configurations for macOS, Windows, and Linux

### Key Features Implementation

**Window Management:**
- Close behavior: Hides window to system tray instead of quitting
- System tray toggle functionality
- Custom user agent for Google Chat compatibility

**Notifications:**
- Title change detection for new message alerts
- Debounced notification system to prevent spam
- Native OS notification integration

**Keyboard Shortcuts:**
- `Cmd/Ctrl + R`: Page refresh
- `Cmd/Ctrl + Shift + R`: Hard refresh
- `Cmd/Ctrl + W`: Hide window (not quit)
- `Cmd/Ctrl + N`: New chat
- `F12`: Toggle DevTools
- `Cmd/Ctrl + Q`: Quit application

## Development Notes

- Application loads Google Chat directly via `mainWindow.loadURL('https://chat.google.com')`
- The `index.html` file primarily serves as a loading screen
- All user interaction happens within the loaded Google Chat web application
- Development mode automatically opens DevTools and logs memory usage
- Performance metrics are logged both in main and renderer processes

## Build Configuration

Uses electron-builder with platform-specific settings:
- **macOS**: DMG installer with multi-architecture support (x64, arm64)
- **Windows**: NSIS installer with desktop shortcuts
- **Linux**: AppImage and DEB packages

Build output goes to `dist/` directory.