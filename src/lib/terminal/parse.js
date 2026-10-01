/**
 * @file Splits a terminal input line into a command name and arguments.
 * @module lib/terminal/parse
 */

// "Cat  About.txt" → { name: 'cat', args: ['About.txt'], rest: 'About.txt' }.
// The name is case-insensitive; args keep their case. `rest` is the raw text
// after the name (for echo-style commands that care about spacing).
export function parseInput(raw) {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\S+)\s*(.*)$/s);
  if (!match) return { name: '', args: [], rest: '' };
  const rest = match[2];
  return {
    name: match[1].toLowerCase(),
    args: rest ? rest.split(/\s+/) : [],
    rest,
  };
}
