/**
 * @file Command registry — one place that knows every terminal command.
 *
 * A command is:
 *   {
 *     name, aliases?, group, description, usage?, hidden?,
 *     complete?: 'path' | 'dir' | string[],   // what Tab completes after the name
 *     run(ctx, input) → delayMs | null | Promise<delayMs | null>
 *   }
 * `input` is the parsed line ({ name, args, rest }). The returned delay is how
 * long the staggered output takes; null means the command manages the screen
 * itself (clear, exit) and no trailing blank line is added.
 * @module lib/terminal/registry
 */

// [key, title, compact]. Compact groups list names only (`man` explains them),
// keeping `help` short enough to read at a glance.
export const GROUPS = [
  ['about', 'about me', false],
  ['shell', 'shell', true],
  ['session', 'session', true],
];

export function createRegistry(commands) {
  const byName = new Map();
  for (const command of commands) {
    for (const name of [command.name, ...(command.aliases ?? [])]) {
      if (byName.has(name)) throw new Error(`Duplicate command name: ${name}`);
      byName.set(name, command);
    }
  }

  const visible = commands.filter((c) => !c.hidden);

  return {
    find: (name) => byName.get(name) ?? null,
    all: () => commands,
    visible: () => visible,
    // Names offered by tab-completion and typo suggestions — never hidden ones.
    visibleNames: () => visible.map((c) => c.name),
  };
}
