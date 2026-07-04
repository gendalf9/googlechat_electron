// Timer/interval registry singleton.
// Node module cache guarantees a single instance across the main-process
// require graph (verified by Phase 1 identity test).
//
// Inherited limitation (M3, technical review): cleanupWindow clears the GLOBAL
// Set, breaking per-window semantics. Masked today by single-window +
// hide-only close ('closed' never fires on user close). This refactor carries
// the limitation forward as a single-window invariant — per-window tracking is
// YAGNI until multi-window support is added.

const timers = new Set();
const intervals = new Set();

function trackTimer(fn, delay) {
  const timer = setTimeout(fn, delay);
  timers.add(timer);
  return timer;
}

function trackInterval(fn, delay) {
  const interval = setInterval(fn, delay);
  intervals.add(interval);
  return interval;
}

function removeTimer(timer) {
  clearTimeout(timer);
  timers.delete(timer);
}

function removeInterval(interval) {
  clearInterval(interval);
  intervals.delete(interval);
}

function clearAllTimers() {
  timers.forEach(timer => clearTimeout(timer));
  timers.clear();
}

function clearAllIntervals() {
  intervals.forEach(interval => clearInterval(interval));
  intervals.clear();
}

module.exports = {
  timers,
  intervals,
  trackTimer,
  trackInterval,
  removeTimer,
  removeInterval,
  clearAllTimers,
  clearAllIntervals
};
