# Google Chat Desktop

A lightweight, optimized desktop application for Google Chat built with Electron.

## Features

- ✅ **Native Desktop Experience**: Google Chat web app in a native desktop environment
- ✅ **CPU Optimized**: Minimal resource usage with smart performance optimizations
- ✅ **System Tray Integration**: Background running with tray icon support
- ✅ **External Links Handling**: Automatically opens external links in your default browser
- ✅ **Right-Click Support**: Full context menu with copy, paste, search, and more
- ✅ **Universal Binary**: Native performance on both Intel and Apple Silicon Macs
- ✅ **Cross-Platform**: Supports Windows, macOS, and Linux
- ✅ **Keyboard Shortcuts**: Productivity shortcuts for common actions

## System Requirements

- Node.js 18.x or higher
- npm or yarn package manager

## Installation and Usage

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd gchat_electron

# Install dependencies
npm install

# Run in development mode
npm run dev

# Or run in normal mode
npm start
```

### Building

```bash
# Build for all platforms
npm run build

# Build for macOS only (Universal Binary)
npm run build:mac

# Build for Windows only
npm run build:win

# Build for Linux only
npm run build:linux

# Build without creating installers (for testing)
npm run pack
```

## Keyboard Shortcuts

| Shortcut               | Function                           |
| ---------------------- | ---------------------------------- |
| `Cmd/Ctrl + R`         | Refresh page                       |
| `Cmd/Ctrl + Shift + R` | Hard refresh                       |
| `Cmd/Ctrl + N`         | New chat                           |
| `Cmd/Ctrl + W`         | Hide window (doesn't quit the app) |
| `F12`                  | Toggle developer tools             |
| `Cmd/Ctrl + Q`         | Quit application                   |

## Right-Click Context Menu

- **Basic Operations**: Cut, Copy, Paste, Select All
- **Search**: Search selected text on Google
- **Open Link**: Open links in default browser
- **Google Chat Native Menu**: Full access to Google Chat's context menu

## Performance Optimizations

This application includes several optimizations for minimal CPU usage:

- Selective GPU acceleration
- Optimized animation and transition handling
- Smart background process management
- Reduced memory footprint
- Efficient event handling

## File Structure

```
gchat_electron/
├── src/
│   ├── main/                # Main Electron process (modularized)
│   │   ├── index.js         # Entry: app lifecycle, wiring, showNotification
│   │   ├── window.js        # createWindow + cleanupWindow
│   │   ├── tray.js          # System tray
│   │   ├── menu.js          # Application menu
│   │   ├── navigation-guard.js   # setWindowOpenHandler + will-navigate (2 predicates)
│   │   ├── context-menu.js  # Right-click context menu
│   │   ├── session-download-handler.js  # will-download, Korean filename decode
│   │   ├── optimization-injection.js    # did-finish-load renderer bootstrap
│   │   ├── memory-monitor.js
│   │   ├── ipc.js           # 6 IPC handlers
│   │   ├── constants.js     # UA, URLs, domain lists, config
│   │   └── timers.js        # Timer/interval singleton registry
│   └── preload/             # Preload (secure IPC bridge)
│       ├── index.js         # contextBridge API (8 methods)
│       ├── title-observer.js
│       ├── keyboard.js
│       └── error-handler.js
├── index.html               # Loading screen and fallback UI
├── assets/                  # Application resources
│   └── icon.png             # Application icon
└── package.json             # Package configuration

## Architecture

### Main Process (src/main/)

Modular entry (`src/main/index.js`) delegates to focused modules: window
management, system tray, application menu, navigation guards, context menu,
download handling, renderer optimization injection, memory monitoring, and
IPC handlers. See `CHANGELOG.md` [1.1.0] for the modularization rationale.

### Preload Script (src/preload/)

`src/preload/index.js` exposes a stable `electronAPI` (8 methods) via
`contextBridge`. Title-observer, keyboard shortcuts, and error handling are
split into sibling modules required at preload load.

### Renderer (index.html)

- Google Chat web app loading via BrowserWindow
- Loading screen and error handling
- New message notification detection

## Security

This application follows Electron security best practices:

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication via contextBridge
- Sandboxed renderer process

## Development

### Developer Tools

Automatically opens in development mode (`npm run dev`).

### Logging

- Main process logs: View in terminal
- Renderer process logs: View in developer tools console

## Building for Distribution

Built files are generated in the `dist/` directory:

- **macOS**: Universal `.dmg` file (Intel + Apple Silicon)
- **Windows**: `.exe` installer
- **Linux**: `.AppImage` and `.deb` packages

## Continuous Integration

This project uses GitHub Actions for automated builds, testing, and releases:

### Workflow Triggers

- **Push to main/develop**: Full build and test suite
- **Pull requests**: Build verification and code quality checks
- **Tags (v\*)**: Create official releases with downloadable assets
- **Manual dispatch**: On-demand builds

### CI/CD Pipeline

1. **Test Suite**: Jest unit and integration tests with coverage reporting
2. **Multi-platform Build**: Windows, macOS, and Linux packaging
3. **Code Quality**: ESLint, Prettier formatting checks
4. **Security Scan**: Vulnerability assessment and dependency audit
5. **Release**: Automatic GitHub release with platform-specific binaries

### Build Artifacts

- **Windows**: `.exe` installer and `.msi` package
- **macOS**: `.dmg` disk image with Universal Binary support
- **Linux**: `.AppImage`, `.deb`, and `.rpm` packages

### Code Quality Standards

- ESLint for JavaScript code linting
- Prettier for consistent code formatting
- Jest for comprehensive testing coverage
- Security scanning with npm audit and Snyk

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Ensure code quality with `npm run quality`
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Follow ESLint rules and Prettier formatting
- Write tests for new features
- Ensure all tests pass before submitting PRs
- Update documentation as needed

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

- This is an unofficial Google Chat desktop client.
- Application functionality depends on Google Chat web service stability.
- Google account login is required.

## Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Uses Google Chat web service
