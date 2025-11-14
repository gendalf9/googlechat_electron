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

| Shortcut               | Function                                |
| ---------------------- | --------------------------------------- |
| `Cmd/Ctrl + R`        | Refresh page                            |
| `Cmd/Ctrl + Shift + R` | Hard refresh                             |
| `Cmd/Ctrl + N`        | New chat                                |
| `Cmd/Ctrl + W`        | Hide window (doesn't quit the app)      |
| `F12`                  | Toggle developer tools                  |
| `Cmd/Ctrl + Q`        | Quit application                        |

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
├── main.js              # Main Electron process
├── preload.js           # Preload script for secure IPC
├── index.html           # Loading screen and fallback UI
├── assets/              # Application resources
│   └── icon.png        # Application icon
├── package.json         # Package configuration
├── CLAUDE.md            # Development guidance
└── README.md           # This documentation
```

## Architecture

### Main Process (main.js)
- Window creation and management
- System tray implementation
- Menu and shortcut configuration
- External link handling
- Performance optimizations

### Preload Script (preload.js)
- Secure IPC bridge between main and renderer processes
- Google Chat page loading detection
- Keyboard event handling
- Performance monitoring

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

- This is an unofficial Google Chat desktop client.
- Application functionality depends on Google Chat web service stability.
- Google account login is required.

## Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Uses Google Chat web service
