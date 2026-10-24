/**
 * @file "Did you mean …?" suggestions for mistyped commands.
 * @module lib/terminal/suggest
 */

// Classic Levenshtein edit distance.
export function editDistance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

// Closest candidate within `maxDistance` edits, or null.
export function suggest(input, candidates, maxDistance = 2) {
  let best = null;
  let bestDistance = maxDistance + 1;
  for (const candidate of candidates) {
    const d = editDistance(input, candidate);
    if (d < bestDistance) {
      best = candidate;
      bestDistance = d;
    }
  }
  return best;
}
