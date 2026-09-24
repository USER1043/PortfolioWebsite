/**
 * @file Interactive terminal engine — command registry, history, output renderer, boot & exit sequences.
 * @module lib/terminal
 */

/* ─────────────────────────────────────────────
   Command History
   ───────────────────────────────────────────── */

class CommandHistory {
  constructor() {
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

  // Returns a copy of history in chronological order.
  all() {
    return [...this._history].reverse();
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
  promptEcho(cmd) {
    const div = document.createElement('div');
    div.className = 'terminal-line terminal-line--prompt-echo';
    div.innerHTML =
      `<span class="prompt-user">prajan</span>` +
      `<span class="prompt-at">@</span>` +
      `<span class="prompt-host">portfolio</span>` +
      `<span class="prompt-colon">:</span>` +
      `<span class="prompt-tilde">~</span>` +
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

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

// Escapes HTML special chars for safe text injection.
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Returns a promise that resolves after `ms` milliseconds.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Types text into an input element character by character for a typewriter feel.
async function typewriter(inputEl, text, baseSpeed = 55) {
  for (const char of text) {
    inputEl.value += char;
    await wait(baseSpeed + Math.random() * 20 - 10);
  }
}

/* ─────────────────────────────────────────────
   Command Definitions
   ───────────────────────────────────────────── */

const STAGGER = 55; // ms between staggered output lines

// Renders the help command list.
function cmdHelp(r) {
  const entries = [
    ['aboutme',  'Displays who I am'],
    ['social',   'Lists social networks'],
    ['projects', 'View coding projects'],
    ['email',    'Send me an email'],
    ['history',  'View command history'],
    ['help',     'Displays this help message'],
    ['clear',    'Clear the terminal'],
    ['exit',     'Close the terminal'],
  ];

  let d = 0;
  r.blank();
  entries.forEach(([cmd, desc]) => {
    r.line(cmd, 'terminal-line--cmd', d);
    d += STAGGER;
    r.line(`  ↳ ${desc}`, 'terminal-line--desc', d);
    d += STAGGER;
  });

  return d + STAGGER;
}

// Renders the about-me biography and stack.
function cmdAboutme(r) {
  const bioLines = [
    "A CS undergrad obsessed with depth. I don't ship features until they",
    "work exactly as intended for the person using them. I've built",
    "production systems that handle real users — job aggregation platforms",
    "with 700+ postings, password managers with military-grade crypto,",
    "and education platforms for kids with autism.",
  ];

  const stackLines = [
    ['Deep  ', 'React, Node.js, MongoDB, Express, Redux'],
    ['Solid ', 'Rust, TypeScript, Python, C++, PostgreSQL'],
    ['DSA   ', 'C++, algorithmic thinking, optimization'],
  ];

  let d = 0;
  r.blank();
  r.line('// whoami', 'terminal-line--info', d); d += STAGGER;
  r.blank();

  bioLines.forEach((l) => {
    r.line(l, 'terminal-line--default', d);
    d += STAGGER;
  });

  r.blank();
  r.line('Currently leading web architecture at Intel IoT Club while building', 'terminal-line--default', d); d += STAGGER;
  r.line('Jobify into a full-scale product. I think in systems: how data flows,', 'terminal-line--default', d); d += STAGGER;
  r.line('where latency hides, what breaks first.', 'terminal-line--default', d); d += STAGGER;

  r.blank();
  r.line('// stack', 'terminal-line--info', d); d += STAGGER;
  r.blank();

  stackLines.forEach(([label, val]) => {
    r.html(
      `  <span style="color:var(--cmd-cyan)">${label}</span>` +
      `<span style="color:var(--text-muted)">→</span>  ` +
      `<span style="color:#828294">${escHtml(val)}</span>`,
      'terminal-line--default',
      d,
    );
    d += STAGGER;
  });

  return d + STAGGER;
}

// Renders social network links.
function cmdSocial(r) {
  const links = [
    ['GitHub   ', 'https://github.com/USER1043',              'github.com/prajan-karthik'],
    ['LinkedIn ', 'https://linkedin.com/in/prajan-karthik', 'linkedin.com/in/prajan-karthik'],
    ['Email    ', 'mailto:prjnkrthk@gmail.com',              'prjnkrthk@gmail.com'],
  ];

  let d = 0;
  r.blank();
  r.line('// social networks', 'terminal-line--info', d); d += STAGGER;
  r.blank();

  links.forEach(([label, href, display]) => {
    r.html(
      `  <span style="color:var(--cmd-cyan)">${label}</span>` +
      `<span style="color:var(--text-muted)">→</span>  ` +
      `<a href="${href}" target="_blank" rel="noopener noreferrer">${escHtml(display)}</a>`,
      'terminal-line--default',
      d,
    );
    d += STAGGER;
  });

  return d + STAGGER;
}

// Renders the projects list from the `projects` content collection.
function cmdProjects(r, projects) {
  let d = 0;
  r.blank();
  r.line('// projects', 'terminal-line--info', d); d += STAGGER;

  if (projects.length === 0) {
    r.blank();
    r.line('  No projects yet.', 'terminal-line--desc', d); d += STAGGER;
  }

  projects.forEach((p) => {
    const link = p.demo || p.github;
    r.blank();
    r.html(
      `  <span style="color:var(--cmd-cyan);font-weight:500">● ${escHtml(p.name)}</span>` +
      `  <span style="color:var(--text-muted);font-size:0.8rem">${escHtml(p.tech.join(' + '))}</span>`,
      'terminal-line--default',
      d,
    ); d += STAGGER;
    r.line(`    Status : ${p.status}`, 'terminal-line--desc', d); d += STAGGER;
    r.line(`    ${p.summary}`, 'terminal-line--desc', d); d += STAGGER;
    if (link) {
      r.html(
        `    Link   : <a href="${escHtml(link)}" target="_blank" rel="noopener noreferrer">${escHtml(link)}</a>`,
        'terminal-line--default',
        d,
      ); d += STAGGER;
    }
  });

  return d + STAGGER;
}

// Opens the mail client and prints a confirmation.
function cmdEmail(r) {
  r.blank();
  r.line('Opening email client...', 'terminal-line--muted', 0);
  r.html(
    `  → <a href="mailto:prjnkrthk@gmail.com">prjnkrthk@gmail.com</a>`,
    'terminal-line--default',
    STAGGER,
  );
  window.location.href = 'mailto:prjnkrthk@gmail.com';
  return STAGGER * 2;
}

// Renders the session command history list.
function cmdHistory(r, history) {
  r.blank();
  if (history.length === 0) {
    r.line('No commands in history yet.', 'terminal-line--desc', 0);
    return STAGGER;
  }
  r.line('// command history', 'terminal-line--info', 0);
  r.blank();
  history.forEach((cmd, i) => {
    r.line(
      `  ${String(i + 1).padStart(3)}  ${cmd}`,
      'terminal-line--desc',
      STAGGER + i * 40,
    );
  });
  return STAGGER + history.length * 40 + STAGGER;
}

/* ─────────────────────────────────────────────
   Boot Sequence
   ───────────────────────────────────────────── */

// Runs the page-load typewriter boot — auto-types "help" and displays the output.
async function bootSequence(r, inputEl, bodyEl) {
  await wait(350);
  await typewriter(inputEl, 'help', 60);
  await wait(200);

  inputEl.value = '';
  r.promptEcho('help');

  const totalDelay = cmdHelp(r);
  await wait(totalDelay + 200);

  r.blank();
  r.scrollToBottom(bodyEl);
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
export function initTerminal({ outputEl, inputEl, bodyEl, terminalWindowEl, sessionEndedEl, projects = [] }) {
  const r        = new OutputRenderer(outputEl);
  const cmdHist  = new CommandHistory();
  /** @type {string[]} */
  let sessionLog = [];
  let isMinimized = false;
  let isMaximized = false;

  const ALL_COMMANDS = ['aboutme', 'clear', 'email', 'exit', 'help', 'history', 'projects', 'social'];

  // Focus input when clicking anywhere in the body.
  bodyEl.addEventListener('click', () => inputEl.focus());

  // ── Window control buttons ──

  // Red close button — triggers the exit/shutdown sequence.
  const btnClose = document.getElementById('btn-close');
  if (btnClose) {
    btnClose.style.cursor = 'pointer';
    btnClose.addEventListener('click', async () => {
      const inp = document.getElementById('terminal-input');
      if (inp) inp.value = '';
      r.promptEcho('exit');
      await exitSequence(r, terminalWindowEl, sessionEndedEl, bodyEl);
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
  bootSequence(r, inputEl, bodyEl).then(() => inputEl.focus());

  // Reconnect: reset state and re-run boot when the user clicks the overlay.
  sessionEndedEl.addEventListener('click', () => {
    sessionEndedEl.classList.remove('visible');

    terminalWindowEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    terminalWindowEl.style.opacity    = '1';
    terminalWindowEl.style.transform  = 'scale(1) translateY(0)';

    r.clear();
    sessionLog = [];
    cmdHist._history = [];
    cmdHist._pointer = -1;

    bootSequence(r, inputEl, bodyEl).then(() => inputEl.focus());
  });

  // Keyboard handler — routes all terminal interactions.
  inputEl.addEventListener('keydown', async (e) => {

    // Tab autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      const val = inputEl.value.trim().toLowerCase();
      if (!val) return;
      const match = ALL_COMMANDS.find((c) => c.startsWith(val));
      if (match) inputEl.value = match;
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
      const cmd = raw.toLowerCase();
      inputEl.value = '';

      if (!cmd) return;

      cmdHist.push(cmd);
      sessionLog.push(cmd);
      r.promptEcho(cmd);

      // ── Command dispatch ──
      if (cmd === 'exit') {
        await exitSequence(r, terminalWindowEl, sessionEndedEl, bodyEl);
        return;
      }

      if (cmd === 'clear') {
        bodyEl.style.opacity = '0';
        await wait(200);
        r.clear();
        bodyEl.style.opacity = '1';
        return;
      }

      let totalDelay = 0;

      if (cmd === 'help') {
        totalDelay = cmdHelp(r);
      } else if (cmd === 'aboutme') {
        totalDelay = cmdAboutme(r);
      } else if (cmd === 'social') {
        totalDelay = cmdSocial(r);
      } else if (cmd === 'projects') {
        totalDelay = cmdProjects(r, projects);
      } else if (cmd === 'email') {
        totalDelay = cmdEmail(r);
      } else if (cmd === 'history') {
        totalDelay = cmdHistory(r, sessionLog.slice(0, -1));
      } else {
        // Unknown command fallback
        r.blank();
        r.line(`bash: ${cmd}: command not found`, 'terminal-line--error', 0);
        r.line(`Type 'help' to see available commands.`, 'terminal-line--desc', STAGGER);
        totalDelay = STAGGER * 2;
      }

      setTimeout(() => {
        r.blank();
        r.scrollToBottom(bodyEl);
      }, totalDelay + 80);
    }
  });
}
