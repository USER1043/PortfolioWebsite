/**
 * @file Colour themes for the terminal. The CSS lives in src/styles/global.css
 * (`:root[data-theme=…]`); this list drives the `theme` command and the
 * pre-paint script, so names must match.
 * @module lib/terminal/themes
 */

export const DEFAULT_THEME = 'mocha';
export const THEME_STORAGE_KEY = 'theme';

// `preview` accent colours are shown as swatches by `theme list`.
export const THEMES = [
  { name: 'mocha', description: 'Catppuccin Mocha (default)', preview: ['#89DCEB', '#A6E3A1', '#CBA6F7'] },
  { name: 'gruvbox', description: 'Warm retro groove', preview: ['#8EC07C', '#B8BB26', '#D3869B'] },
  { name: 'dracula', description: 'Dark, with a bite', preview: ['#8BE9FD', '#50FA7B', '#FF79C6'] },
  { name: 'fire', description: 'Charizard orange', preview: ['#FFA452', '#FFD166', '#CD6A6A'] },
];

export const THEME_NAMES = THEMES.map((t) => t.name);

export const isTheme = (name) => THEME_NAMES.includes(name);
