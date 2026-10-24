/**
 * @file Hidden easter-egg commands. None of these appear in `help`, Tab
 * completion or typo suggestions — they're for people who poke around.
 * @module lib/terminal/commands/fun
 */
import { STAGGER, escHtml } from '../util.js';
import { absolutePath } from '../vfs.js';
import { EMAIL } from './profile.js';
import { printLines } from './core.js';

// Shared fields for every hidden command.
const egg = (command) => ({ group: 'fun', hidden: true, description: '🥚', ...command });

// One plain line (rendered as text, so user input is always safe).
function say(r, text, className = 'terminal-line--default') {
  r.blank();
  r.line(text, className, 0);
  return STAGGER;
}

/* ── sudo / make ── */

const sudo = egg({
  name: 'sudo',
  description: 'nice try',
  run({ r }, { rest }) {
    const command = rest.trim();
    if (!command) return say(r, 'usage: sudo <command>', 'terminal-line--error');
    if (/^make me a sandwich$/i.test(command)) return say(r, 'Okay.', 'terminal-line--success');
    if (/^rm\b/.test(command)) return say(r, 'nice try. 🙃', 'terminal-line--info');

    r.blank();
    r.line('[sudo] password for visitor: ********', 'terminal-line--muted', 0);
    r.line('visitor is not in the sudoers file. This incident will be reported.', 'terminal-line--error', STAGGER * 4);
    return STAGGER * 5;
  },
});

const make = egg({
  name: 'make',
  run({ r }, { rest }) {
    if (/^me a sandwich$/i.test(rest.trim())) return say(r, 'What? Make it yourself.');
    return say(r, 'make: *** No targets specified and no makefile found.  Stop.', 'terminal-line--error');
  },
});

/* ── rm ── */

const DANGEROUS_TARGETS = new Set(['/', '/*', '~', '~/', '~/*', '*', '.', './', '/home/prajan']);
const SYSTEM_PATHS = [
  '/usr/bin/vim',
  '/etc/hostname',
  '/var/log/regrets.log',
  '/home/prajan/.bash_history',
  '/boot/vmlinuz-linux',
];

// Every file path in the fake filesystem, as absolute paths.
function allPaths(node, segs = []) {
  if (node.type === 'file') return [absolutePath(segs)];
  return Object.entries(node.children).flatMap(([name, child]) => allPaths(child, [...segs, name]));
}

const rm = egg({
  name: 'rm',
  run({ r, fs }, { args }) {
    const flags = args.filter((a) => a.startsWith('-')).join('');
    const targets = args.filter((a) => !a.startsWith('-'));
    if (targets.length === 0) return say(r, 'rm: missing operand', 'terminal-line--error');

    const forceful = /[rR]/.test(flags) && flags.includes('f');
    if (!forceful || !targets.some((t) => DANGEROUS_TARGETS.has(t))) {
      return say(r, `rm: cannot remove '${targets[0]}': Read-only file system`, 'terminal-line--error');
    }

    const doomed = [...allPaths(fs), ...SYSTEM_PATHS];
    let d = 0;
    r.blank();
    for (const path of doomed) {
      r.line(`removed '${path}'`, 'terminal-line--error', d);
      d += 35;
    }
    d += 600;
    r.blank();
    r.line('…just kidding. nice try though. 😅', 'terminal-line--success', d);
    return d + STAGGER;
  },
});

/* ── editors ── */

const vim = egg({
  name: 'vim',
  aliases: ['vi', 'nvim'],
  run({ r, shell }) {
    shell.inVim = true;
    r.blank();
    let d = printLines(r, ['~', '~', '~', '~'], 'terminal-line--muted', 0);
    r.line('"untitled" [New File]', 'terminal-line--default', d); d += STAGGER;
    r.line("-- you're in vim now. good luck --", 'terminal-line--info', d);
    return d + STAGGER;
  },
});

const quitVim = egg({
  name: ':q',
  aliases: [':q!', ':wq', ':x'],
  run({ r, shell }) {
    if (!shell.inVim) return say(r, "you're not in vim. relax.", 'terminal-line--muted');
    shell.inVim = false;
    return say(r, 'you exited vim. that puts you ahead of most developers. 🏆', 'terminal-line--success');
  },
});

const nano = egg({
  name: 'nano',
  run: ({ r }) => say(r, 'nano? a person of culture. (this disk is read-only though)'),
});

const emacs = egg({
  name: 'emacs',
  run: ({ r }) => say(r, 'emacs: a great operating system, lacking only a decent editor.'),
});

/* ── fortune & charizard-say ── */

export const FORTUNES = [
  'There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors.',
  'It works on my machine.',
  "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'To understand recursion, you must first understand recursion.',
  '99 little bugs in the code. Take one down, patch it around… 127 little bugs in the code.',
  'Weeks of coding can save you hours of planning.',
  'The best code is no code at all.',
  'A good programmer looks both ways before crossing a one-way street.',
  "git commit -m 'final fix' && git commit -m 'final fix 2'",
  'Premature optimization is the root of all evil. — Donald Knuth',
  'Talk is cheap. Show me the code. — Linus Torvalds',
  'Real programmers count from 0.',
  "There's no place like 127.0.0.1.",
  "If it compiles on the first try, check that you saved the file.",
];

const fortune = egg({
  name: 'fortune',
  run({ r, random = Math.random }) {
    const pick = FORTUNES[Math.floor(random() * FORTUNES.length) % FORTUNES.length];
    return say(r, pick, 'terminal-line--desc');
  },
});

const BUBBLE_WIDTH = 40;

// Word-wraps text to `width` columns, hard-splitting words that are too long.
export function wrap(text, width = BUBBLE_WIDTH) {
  const lines = [];
  let current = '';
  for (let word of text.split(/\s+/).filter(Boolean)) {
    while (word.length > width) {
      if (current) { lines.push(current); current = ''; }
      lines.push(word.slice(0, width));
      word = word.slice(width);
    }
    if (!current) current = word;
    else if (current.length + 1 + word.length <= width) current += ` ${word}`;
    else { lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines;
}

// cowsay-style speech bubble around the wrapped lines.
export function bubble(text) {
  const lines = wrap(text);
  const width = Math.max(...lines.map((l) => l.length));
  const pad = (l) => l.padEnd(width);
  const body = lines.length === 1
    ? [`< ${pad(lines[0])} >`]
    : lines.map((l, i) => {
      const [left, right] = i === 0 ? ['/', '\\'] : i === lines.length - 1 ? ['\\', '/'] : ['|', '|'];
      return `${left} ${pad(l)} ${right}`;
    });
  return [` ${'_'.repeat(width + 2)}`, ...body, ` ${'-'.repeat(width + 2)}`];
}

const CHARIZARD = [
  '   \\',
  '    \\    /\\  /\\',
  '     \\  /  \\/  \\___',
  '       (  o  o     )~~🔥',
  '        \\   ^   __/',
  '         |_| |_|',
];

const charizardSay = egg({
  name: 'charizard-say',
  aliases: ['cowsay'],
  run({ r }, { rest }) {
    r.blank();
    const d = printLines(r, [...bubble(rest.trim() || 'Rawr.'), ...CHARIZARD], 'terminal-line--default', 0);
    return d;
  },
});

/* ── misc ── */

const hire = egg({
  name: 'hire',
  aliases: ['hire-me'],
  run({ r }) {
    r.blank();
    let d = printLines(r, [
      '// why hire prajan',
      '  ✔ ships things that actually work',
      '  ✔ reads the docs (sometimes twice)',
      '  ✔ already exited vim at least once',
    ], 'terminal-line--default', 0);
    r.blank();
    r.html(`  → <a href="mailto:${EMAIL}">${escHtml(EMAIL)}</a>  or type: contact`, 'terminal-line--success', d);
    d += STAGGER;
    return d;
  },
});

const COFFEE_STEPS = 10;
const COFFEE_STEP_MS = 120;

// "brewing [####······] 40%".
export function coffeeBar(step, steps = COFFEE_STEPS) {
  return `brewing [${'#'.repeat(step)}${'·'.repeat(steps - step)}] ${Math.round((step / steps) * 100)}%`;
}

const coffee = egg({
  name: 'coffee',
  aliases: ['brew'],
  run({ r, reducedMotion }) {
    const done = '☕ ready. back to shipping.';
    r.blank();
    if (reducedMotion) {
      r.line(done, 'terminal-line--success', 0);
      return STAGGER;
    }
    // One line that fills up in place, then the result.
    const bar = r.line(coffeeBar(0), 'terminal-line--muted', 0);
    for (let step = 1; step <= COFFEE_STEPS; step++) {
      setTimeout(() => { bar.textContent = coffeeBar(step); }, step * COFFEE_STEP_MS);
    }
    const total = (COFFEE_STEPS + 1) * COFFEE_STEP_MS;
    setTimeout(() => r.line(done, 'terminal-line--success', 0), total);
    return total + STAGGER;
  },
});

const ping = egg({
  name: 'ping',
  run({ r, random = Math.random }, { args }) {
    const host = args[0];
    if (!host) return say(r, 'ping: usage error: Destination address required', 'terminal-line--error');
    if (/^(prajan|portfolio)$/i.test(host)) return say(r, 'prajan is online and caffeinated ☕', 'terminal-line--success');

    const times = [1, 2, 3, 4].map(() => (5 + random() * 20).toFixed(2));
    let d = 0;
    r.blank();
    r.line(`PING ${host} (127.0.0.1) 56(84) bytes of data.`, 'terminal-line--default', d);
    times.forEach((time, i) => {
      d += STAGGER * 4;
      r.line(`64 bytes from ${host}: icmp_seq=${i + 1} ttl=64 time=${time} ms`, 'terminal-line--default', d);
    });
    d += STAGGER * 2;
    r.blank();
    r.line(`--- ${host} ping statistics ---`, 'terminal-line--muted', d); d += STAGGER;
    r.line('4 packets transmitted, 4 received, 0% packet loss', 'terminal-line--muted', d);
    return d + STAGGER;
  },
});

const hello = egg({
  name: 'hello',
  aliases: ['hi', 'hey'],
  run: ({ r }) => say(r, 'hey 👋 type help to look around.'),
});

const answer = egg({
  name: '42',
  run: ({ r }) => say(r, 'The answer. Now, what was the question?'),
});

export const funCommands = [
  sudo, make, rm, vim, quitVim, nano, emacs, fortune, charizardSay, hire, coffee, ping, hello, answer,
];
