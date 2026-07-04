// Optimization injection — extracted from main.js:280-394.
//
// M4 (technical review): the .toString() injection mechanism is PRESERVED, not
// migrated to preload. Reasons: (a) contextIsolation means the preload runs in
// an isolated world and cannot see page-world globals like window.electronAPI
// or document directly the way this script does; (b) moving to preload would
// re-inject on every top-level navigation, applying the optimization CSS /
// external-link hook to auth-redirect pages (accounts.google.com) and breaking
// the login UI. did-finish-load fires once per full load completion, which is
// the correct timing.

// Renderer-side optimization bootstrap. Serialized via .toString() and run in
// the page world via webContents.executeJavaScript. Preserves main.js:283-380
// verbatim — every reference (window.electronAPI, window.gc, document,
// window.performance.memory) is page-world, accessed only after injection.
function initializeOptimizations() {
  try {
    // Prevent double-init across reloads.
    if (window.gchatEventListenersSetup) {
      return;
    }
    window.gchatEventListenersSetup = true;

    window.gchatCleanupFunctions = window.gchatCleanupFunctions || [];

    const cleanupResources = () => {
      const styles = document.querySelectorAll('style[data-gchat-optimized]');
      styles.forEach(style => style.remove());

      if (window.gchatCleanupFunctions) {
        window.gchatCleanupFunctions.forEach(cleanup => {
          try {
            cleanup();
          } catch (_e) {
            // Ignore cleanup errors.
          }
        });
        window.gchatCleanupFunctions = [];
      }
    };

    const applyStyles = () => {
      if (!document.querySelector('style[data-gchat-optimized]')) {
        const style = document.createElement('style');
        style.setAttribute('data-gchat-optimized', 'true');
        style.textContent =
          '*{animation-duration:0.1s!important;transition-duration:0.1s!important}.loading-indicator,.spinner,.progress{display:none!important}input,textarea,[contenteditable="true"]{animation:none!important;transition:none!important}';
        document.head.appendChild(style);

        window.gchatCleanupFunctions.push(() => {
          const styleToRemove = document.querySelector('style[data-gchat-optimized]');
          if (styleToRemove) styleToRemove.remove();
        });
      }
    };

    const setupExternalLinks = () => {
      const handleExternalLinks = e => {
        const target = e.target.closest('a');
        if (target && target.href && !target.href.includes('chat.google.com')) {
          e.preventDefault();
          e.stopPropagation();
          if (window.electronAPI && window.electronAPI.openExternal) {
            window.electronAPI.openExternal(target.href);
          }
        }
      };

      document.addEventListener('click', handleExternalLinks, true);
      window.gchatCleanupFunctions.push(() => {
        document.removeEventListener('click', handleExternalLinks, true);
      });
    };

    const setupMemoryMonitoring = () => {
      if (window.performance && window.performance.memory) {
        const checkMemory = () => {
          const mem = window.performance.memory;
          const usedMB = Math.round(mem.usedJSHeapSize / 1024 / 1024);
          const limitMB = Math.round(mem.jsHeapSizeLimit / 1024 / 1024);

          if (usedMB > limitMB * 0.8) {
            if (window.gc) window.gc();
            cleanupResources();
          }
        };

        // setTimeout (not setInterval) for cleaner teardown.
        const memoryTimer = setTimeout(() => {
          checkMemory();
          setupMemoryMonitoring(); // Reschedule.
        }, 30000);

        window.gchatCleanupFunctions.push(() => {
          clearTimeout(memoryTimer);
        });
      }
    };

    cleanupResources();
    applyStyles();
    setupExternalLinks();
    setupMemoryMonitoring();
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Inject the optimization bootstrap into the page world. Called on
// did-finish-load. Preserves main.js:383-391 .toString() serialization.
function injectOptimizations(webContents) {
  return webContents
    .executeJavaScript(`(${initializeOptimizations.toString()})();`)
    .catch(error => {
      console.error('JavaScript execution failed:', error);
    });
}

module.exports = { initializeOptimizations, injectOptimizations };
