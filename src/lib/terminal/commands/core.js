/**
 * @file The original portfolio commands: help, aboutme, social, projects,
 * email, contact, history, clear and exit.
 * @module lib/terminal/commands/core
 */
import { GROUPS } from '../registry.js';
import { STAGGER, escHtml } from '../util.js';
import { BIO_LINES, EMAIL, NOW_LINES, SOCIAL, STACK } from './profile.js';

// How many posts `blog` shows without --tag.
export const BLOG_LATEST = 5;

// "  label → value" row used by aboutme and social. `valueHtml` must be safe.
export function labelRow(r, label, valueHtml, delay) {
  r.html(
    `  <span class="t-cmd">${escHtml(label)}</span>` +
    `<span class="t-muted">→</span>  ${valueHtml}`,
    'terminal-line--default',
    delay,
  );
}

// Prints lines with a stagger, starting at `d`; returns the next delay.
export function printLines(r, lines, className, d) {
  for (const line of lines) {
    r.line(line, className, d);
    d += STAGGER;
  }
  return d;
}

const help = {
  name: 'help',
  group: 'session',
  description: 'Show this help',
  run({ r, registry }) {
    const visible = registry.visible();
    const width = Math.max(...visible.filter((c) => c.group === 'about').map((c) => c.name.length)) + 3;
    let d = 0;
    r.blank();

    for (const [group, title, compact] of GROUPS) {
      const commands = visible.filter((c) => c.group === group);
      if (commands.length === 0) continue;
      r.line(`// ${title}`, 'terminal-line--info', d); d += STAGGER;
      if (compact) {
        const names = commands.map((c) => `<span class="t-cmd">${escHtml(c.name)}</span>`);
        r.html(`  ${names.join('  ')}`, 'terminal-line--default', d);
        d += STAGGER;
      } else {
        for (const c of commands) {
          r.html(
            `  <span class="t-cmd">${escHtml(c.name.padEnd(width))}</span>` +
            `<span class="t-desc">${escHtml(c.description)}</span>`,
            'terminal-line--default',
            d,
          );
          d += STAGGER;
        }
      }
      r.blank();
    }

    r.line('psst… not every command is listed here. try things.', 'terminal-line--info', d); d += STAGGER;
    r.line('Tab completes · ↑/↓ browse history · man <command> for details', 'terminal-line--muted', d);
    return d + STAGGER;
  },
};

const aboutme = {
  name: 'aboutme',
  group: 'about',
  description: 'Show who I am',
  run({ r }) {
    let d = 0;
    r.blank();
    r.line('// whoami', 'terminal-line--info', d); d += STAGGER;
    r.blank();
    d = printLines(r, BIO_LINES, 'terminal-line--default', d);
    r.blank();
    d = printLines(r, NOW_LINES, 'terminal-line--default', d);
    r.blank();
    r.line('// stack', 'terminal-line--info', d); d += STAGGER;
    r.blank();
    for (const [label, value] of STACK) {
      labelRow(r, label, `<span class="t-desc">${escHtml(value)}</span>`, d);
      d += STAGGER;
    }
    return d + STAGGER;
  },
};

const social = {
  name: 'social',
  group: 'about',
  description: 'Show my social links',
  run({ r }) {
    let d = 0;
    r.blank();
    r.line('// social networks', 'terminal-line--info', d); d += STAGGER;
    r.blank();
    for (const [label, href, display] of SOCIAL) {
      labelRow(
        r,
        label,
        `<a href="${escHtml(href)}" target="_blank" rel="noopener noreferrer">${escHtml(display)}</a>`,
        d,
      );
      d += STAGGER;
    }
    return d + STAGGER;
  },
};

const projects = {
  name: 'projects',
  group: 'about',
  description: 'Show my projects',
  run({ r, projects: list }) {
    let d = 0;
    r.blank();
    r.line('// projects', 'terminal-line--info', d); d += STAGGER;

    if (list.length === 0) {
      r.blank();
      r.line('  No projects yet.', 'terminal-line--desc', d); d += STAGGER;
    }

    for (const p of list) {
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
    }

    r.blank();
    r.html('  Full details → <a href="/projects">/projects</a>', 'terminal-line--muted', d); d += STAGGER;
    r.html('  Writing      → <a href="/blog/">/blog</a> <span class="t-muted">(or: blog)</span>', 'terminal-line--muted', d);
    return d + STAGGER;
  },
};

const blog = {
  name: 'blog',
  group: 'about',
  description: 'Show my latest posts',
  usage: 'blog [--tag <tag>]',
  complete: ['--tag'],
  run({ r, posts }, { args }) {
    const tagAt = args.findIndex((a) => a === '--tag' || a === '-t');
    const tag = tagAt === -1 ? null : args[tagAt + 1]?.toLowerCase();
    let d = 0;
    r.blank();

    if (tagAt !== -1 && !tag) {
      r.line('blog: --tag needs a tag, e.g. blog --tag rust', 'terminal-line--error', 0);
      return STAGGER;
    }

    const tags = [...new Set(posts.flatMap((p) => p.tags))].sort();
    const list = tag ? posts.filter((p) => p.tags.includes(tag)) : posts.slice(0, BLOG_LATEST);

    if (tag && list.length === 0) {
      r.line(`blog: no posts tagged '${tag}'`, 'terminal-line--error', d); d += STAGGER;
      if (tags.length) { r.line(`tags: ${tags.join(', ')}`, 'terminal-line--desc', d); d += STAGGER; }
      return d;
    }

    r.line(tag ? `// posts tagged ${tag}` : '// latest posts', 'terminal-line--info', d); d += STAGGER;

    if (posts.length === 0) {
      r.blank();
      r.line('  No posts yet. The first one is on its way.', 'terminal-line--desc', d);
      return d + STAGGER;
    }

    for (const p of list) {
      r.blank();
      r.html(
        `  <span class="t-warn">${escHtml(p.date)}</span>  ` +
        `<a href="/blog/${encodeURIComponent(p.slug)}/">${escHtml(p.title)}</a>`,
        'terminal-line--default',
        d,
      ); d += STAGGER;
      r.line(`              ${p.minutes} min${p.tags.length ? ' · ' + p.tags.map((t) => `#${t}`).join(' ') : ''}`, 'terminal-line--muted', d); d += STAGGER;
    }

    r.blank();
    const more = tag ? `/blog/tag/${encodeURIComponent(tag)}/` : '/blog/';
    r.html(`  All posts → <a href="${more}">${escHtml(more)}</a>`, 'terminal-line--muted', d); d += STAGGER;
    if (!tag && tags.length) {
      r.line(`  Filter: blog --tag <${tags.slice(0, 4).join(' | ')}${tags.length > 4 ? ' | …' : ''}>`, 'terminal-line--muted', d); d += STAGGER;
    }
    return d + STAGGER;
  },
};

const email = {
  name: 'email',
  group: 'about',
  description: 'Send me an email',
  run({ r, actions }) {
    r.blank();
    r.line('Opening email client...', 'terminal-line--muted', 0);
    r.html(`  → <a href="mailto:${EMAIL}">${EMAIL}</a>`, 'terminal-line--default', STAGGER);
    actions.navigate(`mailto:${EMAIL}`);
    return STAGGER * 2;
  },
};

const contact = {
  name: 'contact',
  group: 'about',
  description: 'Open the contact form',
  run({ r, actions }) {
    r.blank();
    r.line('Opening the message form...', 'terminal-line--muted', 0);
    r.html('  → <a href="/contact">/contact</a>', 'terminal-line--default', STAGGER);
    actions.openUrl('/contact');
    return STAGGER * 2;
  },
};

const history = {
  name: 'history',
  group: 'session',
  description: 'Show command history',
  run({ r, history: entries }) {
    r.blank();
    if (entries.length === 0) {
      r.line('No commands in history yet.', 'terminal-line--desc', 0);
      return STAGGER;
    }
    r.line('// command history', 'terminal-line--info', 0);
    r.blank();
    entries.forEach((cmd, i) => {
      r.line(`  ${String(i + 1).padStart(3)}  ${cmd}`, 'terminal-line--desc', STAGGER + i * 40);
    });
    return STAGGER + entries.length * 40 + STAGGER;
  },
};

const clear = {
  name: 'clear',
  group: 'session',
  description: 'Clear the terminal (Ctrl+L)',
  async run({ actions }) {
    await actions.clear();
    return null;
  },
};

const exit = {
  name: 'exit',
  aliases: ['logout'],
  group: 'session',
  description: 'Close the terminal',
  async run({ r, shell, actions }) {
    if (shell.inVim) {
      r.blank();
      r.line("you're still in vim. try :q", 'terminal-line--info', 0);
      return STAGGER;
    }
    await actions.exit();
    return null;
  },
};

export const coreCommands = [aboutme, projects, blog, social, email, contact, help, history, clear, exit];
