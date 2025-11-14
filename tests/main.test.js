const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Mock Electron modules
jest.mock('electron', () => ({
  app: {
    commandLine: {
      appendSwitch: jest.fn()
    },
    disableHardwareAcceleration: jest.fn(),
    whenReady: {
      then: jest.fn()
    },
    on: jest.fn(),
    quit: jest.fn()
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    once: jest.fn(),
    webContents: {
      on: jest.fn(),
      setWindowOpenHandler: jest.fn(),
      executeJavaScript: jest.fn()
    }
  })),
  Menu: {
    buildFromTemplate: jest.fn(),
    setApplicationMenu: jest.fn()
  },
  Tray: jest.fn().mockImplementation(() => ({
    setToolTip: jest.fn(),
    setContextMenu: jest.fn(),
    on: jest.fn()
  })),
  ipcMain: {
    on: jest.fn()
  },
  Notification: jest.fn().mockImplementation(() => ({
    show: jest.fn()
  }),
  shell: {
    openExternal: jest.fn()
  }
}));

// Import the main process functions
const originalMain = require('../main.js');

describe('Main Process Tests', () => {
  let mockApp;
  let mockWindow;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockApp = require('electron').app;
    mockWindow = new (require('electron').BrowserWindow)();
  });

  test('should disable hardware acceleration on startup', () => {
    expect(mockApp.disableHardwareAcceleration).toHaveBeenCalled();
    expect(mockApp.commandLine.appendSwitch).toHaveBeenCalledWith('disable-renderer-backgrounding');
  });

  test('should create window with correct configuration', () => {
    // Test that BrowserWindow would be created with correct options
    const { BrowserWindow } = require('electron');

    expect(BrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: true,
        webPreferences: expect.objectContaining({
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false,
          javascript: true,
          images: true
        })
      })
    );
  });

  test('should set up window open handler for external links', () => {
    const { shell } = require('electron');

    // Simulate window open handler call
    const mockHandler = mockWindow.webContents.setWindowOpenHandler.mock.calls[0][0];
    const result = mockHandler({ url: 'https://example.com' });

    expect(result).toEqual({ action: 'deny' });
    expect(shell.openExternal).toHaveBeenCalledWith('https://example.com');
  });

  test('should allow Google Chat links in window', () => {
    const { shell } = require('electron');

    const mockHandler = mockWindow.webContents.setWindowOpenHandler.mock.calls[0][0];
    const result = mockHandler({ url: 'https://chat.google.com' });

    expect(result).toEqual({ action: 'deny' });
    expect(shell.openExternal).not.toHaveBeenCalled();
  });

  test('should create IPC handlers', () => {
    expect(ipcMain.on).toHaveBeenCalledWith('show-notification', expect.any(Function));
    expect(ipcMain.on).toHaveBeenCalledWith('hide-window', expect.any(Function));
    expect(ipcMain.on).toHaveBeenCalledWith('open-external', expect.any(Function));
  });

  test('should handle show notification IPC call', () => {
    const mockCallback = ipcMain.on.mock.calls.find(call => call[0] === 'show-notification')[1];
    const mockEvent = {};

    mockCallback(mockEvent, 'Test Title', 'Test Body');

    // Notification would be created with correct parameters
    const { Notification } = require('electron');
    expect(Notification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Title',
        body: 'Test Body'
      })
    );
  });

  test('should handle open external IPC call', () => {
    const { shell } = require('electron');
    const mockCallback = ipcMain.on.mock.calls.find(call => call[0] === 'open-external')[1];
    const mockEvent = {};

    mockCallback(mockEvent, 'https://example.com');

    expect(shell.openExternal).toHaveBeenCalledWith('https://example.com');
  });
});