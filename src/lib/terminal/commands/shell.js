/**
 * @file Shell-realism commands: neofetch, a fake filesystem (ls, cd, pwd, cat,
 * open), git log as a career timeline, and small Unix classics.
 * @module lib/terminal/commands/shell
 */
import { STAGGER, escHtml, formatDuration } from '../util.js';
import { absolutePath, getNode, listDir, resolvePath } from '../vfs.js';
import { labelRow, printLines } from './core.js';
import { BIO_LINES, NOW_LINES, SOCIAL, STACK, SYSTEM } from './profile.js';

const HEX = /^#[0-9a-f]{6}$/i;

// Prints a red error line and returns its delay.
function fail(r, message) {
  r.blank();
  r.line(message, 'terminal-line--error', 0);
  return STAGGER;
}

/* ── neofetch ── */

// Half-block art rows → HTML. Each segment is "text" (blank), [text, fg] or [text, fg, bg].
export function artToHtml(art) {
  return (art?.rows ?? [])
    .map((row) =>
      row
        .map((seg) => {
          if (typeof seg === 'string') return escHtml(seg);
          const [text, fg, bg] = seg;
          const style = [
            HEX.test(fg) ? `color:${fg}` : '',
            HEX.test(bg ?? '') ? `background:${bg}` : '',
          ].filter(Boolean).join(';');
          return `<span style="${style}">${escHtml(text)}</span>`;
        })
        .join(''),
    )
    .join('\n');
}

// The info column as [label, value] pairs (label null for the header lines).
export function neofetchInfo({ projects, startedAt, now = Date.now() }) {
  return [
    [null, `${SYSTEM.user}@${SYSTEM.host}`],
    [null, '-'.repeat(`${SYSTEM.user}@${SYSTEM.host}`.length)],
    ['OS', SYSTEM.os],
    ['Kernel', SYSTEM.kernel],
    ['WM', SYSTEM.wm],
    ['Shell', SYSTEM.shell],
    ['Uptime', formatDuration(now - startedAt)],
    ['Projects', `${projects.length} (try: ls projects)`],
    ['Role', SYSTEM.role],
    ['Stack', STACK[0][1]],
  ];
}

const SWATCHES = ['--bg-secondary', '--red', '--green', '--yellow', '--prompt-blue', '--prompt-tilde', '--cmd-cyan', '--text'];

const neofetch = {
  name: 'neofetch',
  aliases: ['fastfetch'],
  group: 'about',
  description: 'System info, with a Charizard',
  run(ctx) {
    const info = neofetchInfo(ctx)
      .map(([label, value], i) =>
        label
          ? `<div><span class="t-cmd">${escHtml(label)}</span>: ${escHtml(value)}</div>`
          : `<div class="${i === 0 ? 't-title' : 't-muted'}">${escHtml(value)}</div>`,
      )
      .join('');
    const swatches = SWATCHES.map((v) => `<span class="neofetch-swatch" style="background:var(${v})"></span>`).join('');

    ctx.r.blank();
    ctx.r.html(
      `<div class="neofetch">` +
        `<pre class="neofetch-art" aria-hidden="true">${artToHtml(ctx.art)}</pre>` +
        `<div class="neofetch-info">${info}<div class="neofetch-swatches">${swatches}</div></div>` +
      `</div>`,
      'terminal-line--default',
      0,
    );
    return STAGGER * 2;
  },
};

/* ── filesystem ── */

const ls = {
  name: 'ls',
  aliases: ['ll', 'dir'],
  group: 'shell',
  description: 'List files',
  usage: 'ls [-a] [-l] [path]',
  complete: 'path',
  run({ r, fs, shell }, { name, args }) {
    const flags = args.filter((a) => a.startsWith('-')).join('');
    const target = args.find((a) => !a.startsWith('-')) ?? '';
    const node = getNode(fs, resolvePath(shell.cwd, target));

    if (!node) return fail(r, `ls: cannot access '${target}': No such file or directory`);
    if (node.type === 'file') {
      r.blank();
      r.line(target, 'terminal-line--default', 0);
      return STAGGER;
    }

    const entries = listDir(node, { all: flags.includes('a') });
    const fmt = (e) =>
      e.type === 'dir'
        ? `<span class="t-dir">${escHtml(e.name)}/</span>`
        : escHtml(e.name);

    r.blank();
    if (entries.length === 0) return STAGGER;
    if (flags.includes('l') || name === 'll') {
      entries.forEach((e, i) => {
        const perms = e.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
        r.html(`<span class="t-muted">${perms}  prajan  prajan</span>  ${fmt(e)}`, 'terminal-line--default', i * 30);
      });
      return entries.length * 30 + STAGGER;
    }
    r.html(entries.map(fmt).join('  '), 'terminal-line--default', 0);
    return STAGGER;
  },
};

const cd = {
  name: 'cd',
  group: 'shell',
  description: 'Change directory',
  usage: 'cd [path]',
  complete: 'dir',
  run({ r, fs, shell, actions }, { args }) {
    const target = args[0] ?? '~';
    const segs = resolvePath(shell.cwd, target);
    const node = getNode(fs, segs);
    if (!node) return fail(r, `cd: ${target}: No such file or directory`);
    if (node.type !== 'dir') return fail(r, `cd: ${target}: Not a directory`);
    shell.cwd = segs;
    actions.setCwd(segs);
    return 0;
  },
};

const pwd = {
  name: 'pwd',
  group: 'shell',
  description: 'Print working directory',
  run({ r, shell }) {
    r.blank();
    r.line(absolutePath(shell.cwd), 'terminal-line--default', 0);
    return STAGGER;
  },
};

// Lines for `cat` on a project file.
function projectLines(r, p, d) {
  r.line(`# ${p.name}`, 'terminal-line--info', d); d += STAGGER;
  r.line(`${p.tech.join(' · ')}  —  ${p.status}`, 'terminal-line--muted', d); d += STAGGER;
  r.blank();
  r.line(p.summary, 'terminal-line--default', d); d += STAGGER;
  if (p.whyItMatters) {
    r.blank();
    r.line(p.whyItMatters, 'terminal-line--desc', d); d += STAGGER;
  }
  r.blank();
  for (const [label, url] of [['GitHub', p.github], ['Demo  ', p.demo]]) {
    if (!url) continue;
    labelRow(r, label, `<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer">${escHtml(url)}</a>`, d);
    d += STAGGER;
  }
  return d;
}

const cat = {
  name: 'cat',
  group: 'shell',
  description: 'Print a file',
  usage: 'cat <file>',
  complete: 'path',
  run({ r, fs, shell }, { args }) {
    const target = args[0];
    if (!target) return fail(r, 'cat: missing file operand (try: ls)');
    const node = getNode(fs, resolvePath(shell.cwd, target));
    if (!node) return fail(r, `cat: ${target}: No such file or directory`);
    if (node.type === 'dir') return fail(r, `cat: ${target}: Is a directory`);

    let d = 0;
    r.blank();
    switch (node.kind) {
      case 'about':
        d = printLines(r, BIO_LINES, 'terminal-line--default', d);
        r.blank();
        d = printLines(r, NOW_LINES, 'terminal-line--default', d);
        break;
      case 'contact':
        for (const [label, href, display] of SOCIAL) {
          labelRow(r, label, `<a href="${escHtml(href)}" target="_blank" rel="noopener noreferrer">${escHtml(display)}</a>`, d);
          d += STAGGER;
        }
        labelRow(r, 'Message  ', '<a href="/contact">/contact</a>', d); d += STAGGER;
        break;
      case 'project':
        d = projectLines(r, node.project, d);
        break;
      case 'secrets':
        d = printLines(r, [
          '# things worth trying',
          '  - editors are a trap',
          "  - ask nicely (or don't)",
          '  - coffee fixes everything',
          '  - charizard has opinions',
          '  - fortunes are free',
          '  - some commands are destructive. allegedly.',
        ], 'terminal-line--desc', d);
        break;
      default:
        r.line(`cat: ${target}: binary file — try: open ${target}`, 'terminal-line--error', d);
        d += STAGGER;
    }
    return d;
  },
};

const open = {
  name: 'open',
  aliases: ['xdg-open'],
  group: 'shell',
  description: 'Open a file or link',
  usage: 'open <file>',
  complete: 'path',
  run({ r, fs, shell, actions }, { args }) {
    const target = args[0];
    if (!target) return fail(r, 'open: missing file operand (try: open resume.pdf)');
    const node = getNode(fs, resolvePath(shell.cwd, target));
    if (!node) return fail(r, `open: ${target}: No such file or directory`);
    if (!node.url) return fail(r, `open: ${target}: nothing to open — try: cat ${target}`);

    r.blank();
    r.html(
      `Opening <a href="${escHtml(node.url)}" target="_blank" rel="noopener noreferrer">${escHtml(node.url)}</a>…`,
      'terminal-line--muted',
      0,
    );
    actions.openUrl(node.url);
    return STAGGER;
  },
};

/* ── git ── */

// Stable fake 7-char commit hash for a message (FNV-1a).
export function fakeHash(text) {
  let h = 0x811c9dc5;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0').slice(0, 7);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2025-03" or "2025-03-14" → "Mar 2025".
function formatMonth(date) {
  const [y, m] = date.split('-').map(Number);
  return m ? `${MONTHS[m - 1]} ${y}` : String(y);
}

// Dated timeline entries, newest first.
export function timelineCommits(timeline) {
  return timeline
    .filter((t) => t.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t) => ({ hash: fakeHash(t.message), date: formatMonth(t.date), message: t.message }));
}

const git = {
  name: 'git',
  group: 'about',
  description: 'git log — my journey so far',
  usage: 'git log [--oneline] | git status',
  run({ r, timeline }, { args }) {
    const [sub, ...flags] = args;

    if (sub === 'status') {
      r.blank();
      printLines(r, [
        'On branch main',
        "Your branch is up to date with 'origin/main'.",
        '',
        'nothing to commit, working tree clean',
      ], 'terminal-line--default', 0);
      return STAGGER * 4;
    }

    if (sub !== 'log') return fail(r, 'usage: git log [--oneline] | git status');

    const commits = timelineCommits(timeline);
    r.blank();
    if (commits.length === 0) {
      r.line("fatal: your current branch 'main' does not have any commits yet", 'terminal-line--error', 0);
      return STAGGER;
    }

    let d = 0;
    if (flags.includes('--oneline')) {
      for (const c of commits) {
        r.html(`<span class="t-warn">${c.hash}</span> ${escHtml(c.message)}`, 'terminal-line--default', d);
        d += STAGGER;
      }
      return d;
    }

    commits.forEach((c, i) => {
      const head = i === 0 ? ' <span class="t-cmd">(HEAD -&gt; main)</span>' : '';
      r.html(`<span class="t-warn">commit ${c.hash}</span>${head}`, 'terminal-line--default', d); d += STAGGER;
      r.line(`Date:   ${c.date}`, 'terminal-line--muted', d); d += STAGGER;
      r.blank();
      r.line(`    ${c.message}`, 'terminal-line--default', d); d += STAGGER;
      if (i < commits.length - 1) r.blank();
    });
    return d;
  },
};

/* ── small classics ── */

const whoami = {
  name: 'whoami',
  group: 'shell',
  description: 'Print the current user',
  run({ r }) {
    r.blank();
    r.line(SYSTEM.user, 'terminal-line--default', 0);
    r.line('(the long version: aboutme)', 'terminal-line--muted', STAGGER);
    return STAGGER * 2;
  },
};

const date = {
  name: 'date',
  group: 'shell',
  description: 'Print the date and time',
  run({ r }) {
    r.blank();
    r.line(new Date().toString().replace(/\s*\(.*\)$/, ''), 'terminal-line--default', 0);
    return STAGGER;
  },
};

const echo = {
  name: 'echo',
  group: 'shell',
  description: 'Print text',
  usage: 'echo <text>',
  run({ r }, { rest }) {
    r.blank();
    r.line(rest, 'terminal-line--default', 0);
    return STAGGER;
  },
};

const uptime = {
  name: 'uptime',
  group: 'shell',
  description: 'How long this session has been up',
  run({ r, startedAt }) {
    const now = new Date();
    const clock = now.toTimeString().slice(0, 8);
    r.blank();
    r.line(` ${clock} up ${formatDuration(now - startedAt)},  1 user,  load average: 0.42, 0.13, 0.07`, 'terminal-line--default', 0);
    return STAGGER;
  },
};

const man = {
  name: 'man',
  group: 'shell',
  description: 'Show the manual for a command',
  usage: 'man <command>',
  run({ r, registry }, { args }) {
    if (!args[0]) return fail(r, "What manual page do you want? For example, try 'man ls'.");
    const c = registry.find(args[0].toLowerCase());
    if (!c) return fail(r, `No manual entry for ${args[0]}`);

    let d = 0;
    r.blank();
    const section = (title, lines) => {
      r.line(title, 'terminal-line--info', d); d += STAGGER;
      for (const line of lines) { r.line(`    ${line}`, 'terminal-line--default', d); d += STAGGER; }
    };
    section('NAME', [`${c.name} — ${c.description}`]);
    section('SYNOPSIS', [c.usage ?? c.name]);
    if (c.aliases?.length) section('ALIASES', [c.aliases.join(', ')]);
    return d;
  },
};

export const shellCommands = [neofetch, git, ls, cd, pwd, cat, open, whoami, date, echo, uptime, man];
