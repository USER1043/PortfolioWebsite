/**
 * @file Tab completion for command names and file paths.
 * @module lib/terminal/complete
 */
import { completePath } from './vfs.js';

// Longest prefix shared by every string in `list`.
export function commonPrefix(list) {
  if (list.length === 0) return '';
  let prefix = list[0];
  for (const item of list.slice(1)) {
    while (!item.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

// Completes `value` like bash: a unique match is filled in (with a trailing
// space unless it's a directory), several matches extend to their common
// prefix and are returned in `matches` so the caller can list them.
export function completeInput(value, { registry, fs, cwd }) {
  const space = value.lastIndexOf(' ');

  // Completing the command name itself. Hidden commands are never offered.
  if (space === -1) {
    const lower = value.toLowerCase();
    const matches = registry.visibleNames().filter((n) => n.startsWith(lower));
    if (matches.length === 1) return { value: `${matches[0]} `, matches: [] };
    return { value: commonPrefix(matches) || value, matches };
  }

  // Completing an argument: a path, or one of a fixed list of words.
  const name = value.slice(0, value.indexOf(' ')).toLowerCase();
  const kind = registry.find(name)?.complete;
  if (!kind) return { value, matches: [] };

  const head = value.slice(0, space + 1);
  const partial = value.slice(space + 1);
  const matches = Array.isArray(kind)
    ? kind.filter((word) => word.startsWith(partial.toLowerCase()))
    : completePath(fs, cwd, partial, { dirsOnly: kind === 'dir' });
  if (matches.length === 1) {
    const done = matches[0];
    return { value: head + done + (done.endsWith('/') ? '' : ' '), matches: [] };
  }
  return { value: head + (commonPrefix(matches) || partial), matches };
}
