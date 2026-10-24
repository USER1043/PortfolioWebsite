/**
 * @file Small helpers shared by the terminal engine and its commands.
 * @module lib/terminal/util
 */

export const STAGGER = 55; // ms between staggered output lines

// Escapes HTML special chars for safe text injection.
export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Returns a promise that resolves after `ms` milliseconds.
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Formats a duration as "1 hour, 3 mins, 12 secs" (zero parts dropped).
export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const parts = [
    [Math.floor(total / 3600), 'hour'],
    [Math.floor((total % 3600) / 60), 'min'],
    [total % 60, 'sec'],
  ].filter(([n], i, all) => n > 0 || (i === all.length - 1 && total === 0));
  return parts.map(([n, unit]) => `${n} ${unit}${n === 1 ? '' : 's'}`).join(', ');
}
