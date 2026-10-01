/**
 * @file Visual-effect commands: `theme` (listed) and `matrix` (hidden).
 * The Konami-code flyby is wired in the engine, since it isn't a command.
 * @module lib/terminal/commands/effects
 */
import { DEFAULT_THEME, THEMES, THEME_NAMES, isTheme } from '../themes.js';
import { STAGGER, escHtml } from '../util.js';

const theme = {
  name: 'theme',
  group: 'session',
  description: 'Change the colour theme',
  usage: `theme [list | ${THEME_NAMES.join(' | ')}]`,
  complete: THEME_NAMES,
  run({ r, actions }, { args }) {
    const choice = (args[0] ?? 'list').toLowerCase();

    if (choice === 'list') {
      const current = actions.getTheme?.() ?? DEFAULT_THEME;
      const width = Math.max(...THEME_NAMES.map((n) => n.length)) + 2;
      let d = 0;
      r.blank();
      r.line('// themes', 'terminal-line--info', d); d += STAGGER;
      for (const t of THEMES) {
        const swatches = t.preview
          .map((c) => `<span class="theme-swatch" style="background:${escHtml(c)}"></span>`)
          .join('');
        const marker = t.name === current ? '<span class="t-title">*</span>' : ' ';
        r.html(
          ` ${marker} <span class="t-cmd">${escHtml(t.name.padEnd(width))}</span>${swatches}  <span class="t-desc">${escHtml(t.description)}</span>`,
          'terminal-line--default',
          d,
        );
        d += STAGGER;
      }
      r.line('usage: theme <name> — saved for your next visit', 'terminal-line--muted', d);
      return d + STAGGER;
    }

    r.blank();
    if (!isTheme(choice)) {
      r.line(`theme: unknown theme '${args[0]}'. try: theme list`, 'terminal-line--error', 0);
      return STAGGER;
    }
    actions.setTheme(choice);
    r.line(`theme set to ${choice}`, 'terminal-line--success', 0);
    return STAGGER;
  },
};

const matrix = {
  name: 'matrix',
  group: 'fun',
  hidden: true,
  description: '🥚',
  async run({ r, actions, reducedMotion }) {
    r.blank();
    if (reducedMotion) {
      r.line('wake up, neo… the matrix has you. (animations are off on this device)', 'terminal-line--success', 0);
      return STAGGER;
    }
    r.line('wake up, neo…', 'terminal-line--success', 0);
    await actions.matrix();
    r.line('…you took the red pill.', 'terminal-line--muted', 0);
    return STAGGER;
  },
};

// Someone typed the Konami code as text instead of pressing the keys.
const typedArrows = {
  name: '↑',
  aliases: ['↓', '←', '→', 'up', 'uuddlrlrba'],
  group: 'fun',
  hidden: true,
  description: '🥚',
  run({ r }) {
    r.blank();
    r.line('so close. press the actual arrow keys, then B and A: ↑ ↑ ↓ ↓ ← → ← → B A', 'terminal-line--info', 0);
    return STAGGER;
  },
};

export const effectCommands = [theme, matrix, typedArrows];
