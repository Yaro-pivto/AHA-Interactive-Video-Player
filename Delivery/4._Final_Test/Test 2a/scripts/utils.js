/**
 * utils.js
 * Shared utility helpers used across the player modules.
 */

// ─── sanitizeSheetName ────────────────────────────────────────────────────────
/**
 * Make a string safe for use as an Excel sheet name.
 * Rules: max 31 chars, no characters [ ] : * ? / \
 * @param {string} name
 * @returns {string}
 */
export function sanitizeSheetName(name) {
  return name
    .replace(/[\[\]:*?/\\]/g, '')
    .substring(0, 31)
    .trim();
}

// ─── parseBoolean ─────────────────────────────────────────────────────────────
/**
 * Convert various "correct" representations to a boolean.
 * Handles: true, false, 1, 0, "TRUE", "FALSE", "yes", "no"
 * @param {*} val
 * @returns {boolean}
 */
export function parseBoolean(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number')  return val === 1;
  const s = String(val ?? '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

// ─── formatTime ───────────────────────────────────────────────────────────────
/**
 * Format seconds to a human-readable MM:SS string.
 * @param {number} seconds
 * @returns {string} e.g. "1:05"
 */
export function formatTime(seconds) {
  const s   = Math.floor(seconds);
  const m   = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}
