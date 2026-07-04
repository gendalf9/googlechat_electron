// Error handler — extracted from preload.js:225-235.
// Deduplicates page errors via WeakSet (auto GC of error refs) and logs once.

let errorLog = new WeakSet();

const errorHandler = e => {
  if (!errorLog.has(e.error)) {
    errorLog.add(e.error);
    console.error('Page error:', e.error);
  }
};

window.addEventListener('error', errorHandler);

function cleanupErrorHandler() {
  window.removeEventListener('error', errorHandler);
  errorLog = null;
}

module.exports = { cleanupErrorHandler };
