/**
 * @file Browser-only visual effects: theme switching, matrix rain and the
 * shiny Charizard flyby. Commands reach these through `ctx.actions`.
 * @module lib/terminal/effects
 */
import { DEFAULT_THEME, THEME_STORAGE_KEY } from './themes.js';

/* ── Themes ── */

export function currentTheme() {
  return document.documentElement.dataset.theme || DEFAULT_THEME;
}

// Applies a theme and remembers it for this visitor (best effort).
export function applyTheme(name) {
  const root = document.documentElement;
  if (name === DEFAULT_THEME) delete root.dataset.theme;
  else root.dataset.theme = name;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, name);
  } catch {
    // Private mode or blocked storage: the theme still applies for this visit.
  }
}

/* ── Matrix rain ── */

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/$#';
const FONT_SIZE = 16;
const FRAME_MS = 50;

// Full-screen green rain. Resolves when the visitor presses a key, clicks or taps.
export function startMatrix() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'matrix-overlay';
    overlay.setAttribute('role', 'presentation');
    const canvas = document.createElement('canvas');
    const hint = document.createElement('div');
    hint.className = 'matrix-hint';
    hint.textContent = 'press any key to exit the matrix';
    overlay.append(canvas, hint);
    document.body.append(overlay);

    const ctx = canvas.getContext('2d');
    const style = getComputedStyle(document.documentElement);
    const green = style.getPropertyValue('--green').trim() || '#A6E3A1';
    let drops = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.ceil(canvas.width / FONT_SIZE) }, () =>
        Math.floor((Math.random() * canvas.height) / FONT_SIZE),
      );
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    let last = 0;
    let frame = 0;
    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      if (time - last < FRAME_MS) return;
      last = time;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = green;
      ctx.font = `${FONT_SIZE}px monospace`;
      drops.forEach((y, i) => {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillText(glyph, i * FONT_SIZE, y * FONT_SIZE);
        drops[i] = y * FONT_SIZE > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    };

    const stop = (event) => {
      // Swallow the key so it isn't typed into the terminal.
      event?.preventDefault();
      event?.stopPropagation();
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', stop, true);
      overlay.removeEventListener('pointerdown', stop);
      window.removeEventListener('resize', resize);
      overlay.remove();
      resolve();
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', stop, true);
    overlay.addEventListener('pointerdown', stop);
  });
}

/* ── Shiny Charizard flyby ── */

// One shiny Charizard flies across the screen, then removes itself.
export function shinyFlyby() {
  const img = document.createElement('img');
  img.src = '/charizard-shiny.png';
  img.alt = '';
  img.className = 'shiny-flyby';
  img.addEventListener('animationend', () => img.remove(), { once: true });
  document.body.append(img);
}
