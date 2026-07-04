// Setup file for Jest tests
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Define window object if not exists
if (typeof window === 'undefined') {
  global.window = {};
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0,
    __STORE__: store,
    __setStore__: newStore => {
      store = newStore;
      Object.keys(newStore).forEach(key => {
        localStorageMock.length = Object.keys(newStore).length;
      });
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0,
    __STORE__: store
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock fetch
global.fetch = jest.fn();
// Refactor compat: tests read source via these helpers instead of deleted
// root main.js/preload.js. Returns concatenated src/ module contents.
const { readdirSync, readFileSync: _readFileSync } = require('fs');
const sourceDir = (sub) => require('path').join(__dirname, '..', 'src', sub);
const readSource = (sub) =>
  readdirSync(sourceDir(sub))
    .filter(f => f.endsWith('.js'))
    .map(f => _readFileSync(require('path').join(sourceDir(sub), f), 'utf8'))
    .join('\n');
global.readMainSource = () => readSource('main');
global.readPreloadSource = () => readSource('preload');

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalLog = console.log;

beforeEach(() => {
  jest.clearAllMocks();

  // Mock console.error to avoid noise in tests
  console.error = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalError;
  console.log = originalLog;
});
