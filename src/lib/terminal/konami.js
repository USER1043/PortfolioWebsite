/**
 * @file Watches key presses for a sequence (the Konami code by default).
 * @module lib/terminal/konami
 */

export const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
];

// Returns a function to feed each key into; it returns true when the
// sequence has just been completed. Letter keys are case-insensitive.
export function createSequenceMatcher(sequence = KONAMI) {
  const want = sequence.map((k) => (k.length === 1 ? k.toLowerCase() : k));
  let progress = 0;
  return (key) => {
    const k = key.length === 1 ? key.toLowerCase() : key;
    // Keep the longest tail of what's been typed that is still a valid start,
    // so e.g. ↑↑↑↓↓… works.
    const typed = [...want.slice(0, progress), k];
    while (typed.length && !typed.every((x, i) => x === want[i])) typed.shift();
    progress = typed.length;
    if (progress === want.length) {
      progress = 0;
      return true;
    }
    return false;
  };
}
