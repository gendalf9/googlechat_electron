// Mock DOM environment
Object.defineProperty(window, 'performance', {
  value: {
    mark: jest.fn(),
    measure: jest.fn(),
    memory: {
      usedJSHeapSize: 1024 * 1024,
      totalJSHeapSize: 2048 * 1024,
      jsHeapSizeLimit: 4096 * 1024
    },
    timing: {
      navigationStart: 1000,
      loadEventEnd: 2000
    }
  },
  writable: true
});

Object.defineProperty(window, 'document', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    createElement: jest.fn(),
    title: 'Google Chat',
    querySelector: jest.fn(),
    readyState: 'complete'
  },
  writable: true
});

Object.defineProperty(window, 'requestIdleCallback', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(window, 'setTimeout', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(window, 'clearTimeout', {
  value: jest.fn(),
  writable: true
});

// Mock process
global.process = {
  env: {
    NODE_ENV: 'test'
  },
  platform: 'darwin'
};

// Mock ipcRenderer
const mockIpcRenderer = {
  send: jest.fn()
};

jest.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: jest.fn()
  },
  ipcRenderer: mockIpcRenderer
}));

// Load preload script
require('../preload.js');

describe('Preload Script Tests', () => {
  let mockExposeInMainWorld;
  let electronAPI;

  beforeEach(() => {
    jest.clearAllMocks();

    const { contextBridge } = require('electron');
    mockExposeInMainWorld = contextBridge.exposeInMainWorld;

    // Capture the electronAPI object that gets exposed
    mockExposeInMainWorld.mockImplementation((name, api) => {
      if (name === 'electronAPI') {
        electronAPI = api;
      }
    });
  });

  test('should expose electronAPI to main world', () => {
    expect(mockExposeInMainWorld).toHaveBeenCalledWith('electronAPI', expect.any(Object));
    expect(electronAPI).toBeDefined();
  });

  test('should expose notification function', () => {
    expect(typeof electronAPI.showNotification).toBe('function');
  });

  test('should expose hide window function', () => {
    expect(typeof electronAPI.hideWindow).toBe('function');
  });

  test('should expose open external function', () => {
    expect(typeof electronAPI.openExternal).toBe('function');
  });

  test('should expose app version function', () => {
    expect(typeof electronAPI.getAppVersion).toBe('function');
  });

  test('should expose platform function', () => {
    expect(typeof electronAPI.getPlatform).toBe('function');
  });

  test('should expose performance info function', () => {
    expect(typeof electronAPI.getPerformanceInfo).toBe('function');
  });

  test('showNotification should send IPC message', () => {
    electronAPI.showNotification('Test Title', 'Test Body');

    expect(mockIpcRenderer.send).toHaveBeenCalledWith(
      'show-notification',
      'Test Title',
      'Test Body'
    );
  });

  test('hideWindow should send IPC message', () => {
    electronAPI.hideWindow();

    expect(mockIpcRenderer.send).toHaveBeenCalledWith('hide-window');
  });

  test('openExternal should send IPC message', () => {
    const testUrl = 'https://example.com';
    electronAPI.openExternal(testUrl);

    expect(mockIpcRenderer.send).toHaveBeenCalledWith('open-external', testUrl);
  });

  test('getAppVersion should return version', () => {
    const version = electronAPI.getAppVersion();
    expect(version).toBe('1.0.0');
  });

  test('getPlatform should return platform', () => {
    const platform = electronAPI.getPlatform();
    expect(platform).toBe('darwin');
  });

  test('getPerformanceInfo should return performance data', () => {
    const perfInfo = electronAPI.getPerformanceInfo();

    expect(perfInfo).toEqual({
      memory: window.performance.memory,
      timing: window.performance.timing
    });
  });

  test('should add event listeners on DOMContentLoaded', () => {
    expect(document.addEventListener).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function)
    );
  });

  test('should add keyboard event listener', () => {
    expect(document.addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      { passive: false }
    );
  });
});