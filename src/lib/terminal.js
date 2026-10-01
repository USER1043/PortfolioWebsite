/**
 * @file Interactive terminal engine — history, output renderer, input handling,
 * boot & exit sequences. Commands live in ./terminal/commands/.
 * @module lib/terminal
 */
import { buildRegistry } from './terminal/commands/index.js';
import { completeInput } from './terminal/complete.js';
import { parseInput } from './terminal/parse.js';
import { suggest } from './terminal/suggest.js';
import { STAGGER, escHtml, wait } from './terminal/util.js';
import { buildFs, displayPath } from './terminal/vfs.js';

/* ─────────────────────────────────────────────
   Command History
   ───────────────────────────────────────────── */

class CommandHistory {
  constructor() {
    this.reset();
  }

  reset() {
    this._history = [];
    this._pointer = -1;
  }

  // Adds a command entry and resets the navigation pointer.
  push(cmd) {
    if (cmd && cmd !== this._history[0]) {
      this._history.unshift(cmd);
    }
    this._pointer = -1;
  }

  // Returns the previous command (↑ key).
  prev() {
    if (this._pointer < this._history.length - 1) this._pointer++;
    return this._history[this._pointer] ?? '';
  }

  // Returns the next command (↓ key), or empty string at the end.
  next() {
    if (this._pointer <= 0) { this._pointer = -1; return ''; }
    this._pointer--;
    return this._history[this._pointer] ?? '';
  }
}

/* ─────────────────────────────────────────────
   Output Renderer
   ───────────────────────────────────────────── */

class OutputRenderer {
  constructor(outputEl) {
    this._el = outputEl;
  }

  // Appends a styled text line with optional animation delay.
  line(text, className = 'terminal-line--default', delayMs = 0) {
    const div = document.createElement('div');
    div.className = `terminal-line ${className}`;
    div.style.animationDelay = `${delayMs}ms`;
    div.textContent = text;
    this._el.appendChild(div);
    return div;
  }

  // Appends a line containing raw HTML (for links etc.), with delay.
  // Callers must escape any user-provided text with escHtml.
  html(markup, className = 'terminal-line--default', delayMs = 0) {
    const div = document.createElement('div');
    div.className = `terminal-line ${className}`;
    div.style.animationDelay = `${delayMs}ms`;
    div.innerHTML = markup;
    this._el.appendChild(div);
    return div;
  }

  // Appends a blank spacer line.
  blank() {
    const div = document.createElement('div');
    div.className = 'terminal-line terminal-line--blank';
    this._el.appendChild(div);
  }

  // Appends a frozen prompt-echo line (shows the command the user ran).
  promptEcho(cmd, cwd = '~') {
    const div = document.createElement('div');
    div.className = 'terminal-line terminal-line--prompt-echo';
    div.innerHTML =
      `<span class="prompt-user">prajan</span>` +
      `<span class="prompt-at">@</span>` +
      `<span class="prompt-host">portfolio</span>` +
      `<span class="prompt-colon">:</span>` +
      `<span class="prompt-tilde">${escHtml(cwd)}</span>` +
      `<span class="prompt-dollar">$</span>` +
      `&nbsp;<span style="color:var(--text)">${escHtml(cmd)}</span>`;
    this._el.appendChild(div);
  }

  // Removes all output lines.
  clear() {
    this._el.innerHTML = '';
  }

  // Smoothly scrolls the terminal body to the bottom.
  scrollToBottom(bodyEl) {
    bodyEl.scrollTo({ top: bodyEl.scrollHeight, behavior: 'smooth' });
  }
}

// Types text into an input element character by character for a typewriter feel.
async function typewriter(inputEl, text, baseSpeed = 55) {
  for (const char of text) {
    inputEl.value += char;
    await wait(baseSpeed + Math.random() * 20 - 10);
  }
}

/* ─────────────────────────────────────────────
   Exit / Shutdown Sequence
   ───────────────────────────────────────────── */

// Plays the Linux-style shutdown sequence then shows the session-ended overlay.
async function exitSequence(r, terminalWindowEl, sessionEndedEl, bodyEl) {
  r.blank();
  r.line('broadcast message from prajan@portfolio:', 'terminal-line--info', 0);
  r.line('the system is going down for maintenance NOW!', 'terminal-line--error', STAGGER);
  r.blank();
  r.line('Connection to portfolio closed.', 'terminal-line--muted', STAGGER * 2);
  r.line('logout', 'terminal-line--muted', STAGGER * 3);
  r.scrollToBottom(bodyEl);

  await wait(STAGGER * 3 + 700);

  // Shrink & fade the terminal window out.
  terminalWindowEl.style.opacity = '0';
  terminalWindowEl.style.transform = 'scale(0.95) translateY(10px)';

  await wait(520);

  // Reveal the "session ended" screen.
  sessionEndedEl.classList.add('visible');
}

/* ─────────────────────────────────────────────
   Public Init
   ───────────────────────────────────────────── */

// Bootstraps the interactive terminal — call once after the DOM is ready.
// `data` carries the site content: { projects, art, timeline }.
export function initTerminal({
  outputEl, inputEl, bodyEl, terminalWindowEl, sessionEndedEl, promptCwdEl, data = {},
}) {
  const r        = new OutputRenderer(outputEl);
  const cmdHist  = new CommandHistory();
  const registry = buildRegistry();
  const projects = data.projects ?? [];
  const fs       = buildFs(projects);
  const shell    = { cwd: [] };
  /** @type {string[]} */
  let sessionLog = [];
  let isMinimized = false;
  let isMaximized = false;

  const setCwd = (segs) => {
    if (promptCwdEl) promptCwdEl.textContent = displayPath(segs);
  };

  const actions = {
    setCwd,
    navigate: (url) => { window.location.href = url; },
    openUrl: (url) => { window.open(url, '_blank', 'noopener'); },
    clear: async () => {
      bodyEl.style.opacity = '0';
      await wait(200);
      r.clear();
      bodyEl.style.opacity = '1';
    },
    exit: () => exitSequence(r, terminalWindowEl, sessionEndedEl, bodyEl),
  };

  const context = () => ({
    r,
    registry,
    projects,
    fs,
    shell,
    actions,
    art: data.art,
    timeline: data.timeline ?? [],
    startedAt: data.startedAt ?? performance.timeOrigin,
    history: sessionLog.slice(0, -1),
  });

  // Runs one input line: echo it, dispatch, then add the trailing spacing.
  async function execute(raw) {
    const input = parseInput(raw);
    if (!input.name) return;

    cmdHist.push(raw);
    sessionLog.push(raw);
    r.promptEcho(raw, displayPath(shell.cwd));

    const command = registry.find(input.name);
    let delay;
    if (!command) {
      const guess = suggest(input.name, registry.visibleNames());
      r.blank();
      r.line(`bash: ${input.name}: command not found`, 'terminal-line--error', 0);
      r.line(
        guess ? `did you mean '${guess}'?` : `Type 'help' to see available commands.`,
        'terminal-line--desc',
        STAGGER,
      );
      delay = STAGGER * 2;
    } else {
      try {
        delay = await command.run(context(), input);
      } catch (error) {
        console.error(error);
        r.line(`${input.name}: something went wrong`, 'terminal-line--error', 0);
        delay = STAGGER;
      }
    }

    if (delay === null) return;
    setTimeout(() => {
      r.blank();
      r.scrollToBottom(bodyEl);
    }, delay + 80);
  }

  // Runs the page-load typewriter boot — auto-types "help" and runs it.
  async function bootSequence() {
    await wait(350);
    await typewriter(inputEl, 'help', 60);
    await wait(200);
    inputEl.value = '';
    r.promptEcho('help');
    const totalDelay = registry.find('help').run(context(), parseInput('help'));
    await wait(totalDelay + 200);
    r.blank();
    r.scrollToBottom(bodyEl);
  }

  // Focus input when clicking anywhere in the body (but not while selecting text).
  bodyEl.addEventListener('click', () => {
    if (!window.getSelection()?.toString()) inputEl.focus();
  });

  // ── Window control buttons ──

  // Red close button — triggers the exit/shutdown sequence.
  const btnClose = document.getElementById('btn-close');
  if (btnClose) {
    btnClose.style.cursor = 'pointer';
    btnClose.addEventListener('click', async () => {
      inputEl.value = '';
      r.promptEcho('exit', displayPath(shell.cwd));
      await actions.exit();
    });
  }

  // Yellow minimize button — collapses the terminal body to show only the title bar.
  const btnMin = document.getElementById('btn-min');
  if (btnMin) {
    btnMin.style.cursor = 'pointer';
    btnMin.addEventListener('click', () => {
      if (isMaximized) return; // don't minimize while maximized
      isMinimized = !isMinimized;
      bodyEl.style.transition = 'height 0.3s ease, padding 0.3s ease, opacity 0.2s ease';
      if (isMinimized) {
        bodyEl.style.height   = '0';
        bodyEl.style.padding  = '0';
        bodyEl.style.opacity  = '0';
        bodyEl.style.overflow = 'hidden';
      } else {
        bodyEl.style.height   = '';
        bodyEl.style.padding  = '';
        bodyEl.style.opacity  = '1';
        bodyEl.style.overflow = '';
        setTimeout(() => inputEl.focus(), 310);
      }
    });
  }

  // Green maximize button — expands the terminal to fill the viewport.
  const btnMax = document.getElementById('btn-max');
  if (btnMax) {
    btnMax.style.cursor = 'pointer';
    btnMax.addEventListener('click', () => {
      if (isMinimized) return; // don't maximize while minimized
      isMaximized = !isMaximized;
      terminalWindowEl.style.transition = 'max-width 0.3s ease, height 0.3s ease, border-radius 0.3s ease';
      if (isMaximized) {
        terminalWindowEl.style.maxWidth     = '100%';
        terminalWindowEl.style.height       = '100vh';
        terminalWindowEl.style.borderRadius = '0';
      } else {
        terminalWindowEl.style.maxWidth     = '';
        terminalWindowEl.style.height       = '';
        terminalWindowEl.style.borderRadius = '';
      }
      setTimeout(() => inputEl.focus(), 310);
    });
  }

  // Run boot sequence, then hand control to the user.
  bootSequence().then(() => inputEl.focus());

  // Reconnect: reset state and re-run boot when the user clicks the overlay.
  sessionEndedEl.addEventListener('click', () => {
    sessionEndedEl.classList.remove('visible');

    terminalWindowEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    terminalWindowEl.style.opacity    = '1';
    terminalWindowEl.style.transform  = 'scale(1) translateY(0)';

    r.clear();
    sessionLog = [];
    cmdHist.reset();
    shell.cwd = [];
    setCwd([]);

    bootSequence().then(() => inputEl.focus());
  });

  // Keyboard handler — routes all terminal interactions.
  inputEl.addEventListener('keydown', async (e) => {

    // Tab: complete commands and paths; list the options when ambiguous.
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!inputEl.value.trim()) return;
      const before = inputEl.value;
      const { value, matches } = completeInput(before, { registry, fs, cwd: shell.cwd });
      inputEl.value = value;
      if (matches.length > 1 && value === before) {
        r.promptEcho(before, displayPath(shell.cwd));
        r.html(
          matches.map((m) => escHtml(m.slice(m.lastIndexOf('/', m.length - 2) + 1))).join('  '),
          'terminal-line--desc',
        );
        r.scrollToBottom(bodyEl);
      }
      return;
    }

    // Ctrl+C: abandon the current line, like a real shell.
    if (e.ctrlKey && e.key.toLowerCase() === 'c' && inputEl.selectionStart === inputEl.selectionEnd) {
      e.preventDefault();
      r.promptEcho(`${inputEl.value}^C`, displayPath(shell.cwd));
      inputEl.value = '';
      r.scrollToBottom(bodyEl);
      return;
    }

    // Ctrl+L: clear the screen.
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      await actions.clear();
      return;
    }

    // Arrow-up: cycle history backward
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      inputEl.value = cmdHist.prev();
      requestAnimationFrame(() => {
        inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
      });
      return;
    }

    // Arrow-down: cycle history forward
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      inputEl.value = cmdHist.next();
      return;
    }

    // Enter: execute
    if (e.key === 'Enter') {
      const raw = inputEl.value.trim();
      inputEl.value = '';
      await execute(raw);
    }
  });
}
