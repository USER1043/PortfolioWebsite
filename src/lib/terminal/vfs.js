/**
 * @file A tiny read-only virtual filesystem for the terminal (ls, cd, cat, open).
 * Paths are arrays of segments relative to the home directory, so `[]` is `~`
 * and `['projects']` is `~/projects`. Nothing can go above home.
 * @module lib/terminal/vfs
 */

export const HOME = '/home/prajan';

const dir = (children) => ({ type: 'dir', children });

// `kind` tells `cat` how to render the file; `url` is what `open` opens.
const file = (kind, extra = {}) => ({ type: 'file', kind, ...extra });

// "Sensory Safari" → "sensory-safari".
export function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Builds the home directory from the site's real data.
export function buildFs(projects = []) {
  const projectFiles = {};
  for (const project of projects) {
    projectFiles[`${slugify(project.name)}.md`] = file('project', {
      project,
      url: project.demo || project.github,
    });
  }

  return dir({
    'about.txt': file('about'),
    'contact.txt': file('contact', { url: '/contact' }),
    'resume.pdf': file('binary', { url: '/Resume.pdf' }),
    '.secrets': file('secrets'),
    projects: { ...dir(projectFiles), url: '/projects' },
  });
}

// Resolves `input` against `cwd`; returns the new segment array.
// `~`, `/` and `/home/prajan` all mean home.
export function resolvePath(cwd, input = '') {
  let path = input.trim();
  let segs = [...cwd];

  if (path === '' || path === '~' || path === '/') return [];
  if (path.startsWith('~/')) {
    segs = [];
    path = path.slice(2);
  } else if (path === HOME || path.startsWith(`${HOME}/`)) {
    segs = [];
    path = path.slice(HOME.length);
  } else if (path.startsWith('/')) {
    segs = [];
  }

  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') segs.pop();
    else segs.push(part);
  }
  return segs;
}

// The node at `segs`, or null when it doesn't exist.
export function getNode(root, segs) {
  let node = root;
  for (const seg of segs) {
    if (node?.type !== 'dir' || !Object.hasOwn(node.children, seg)) return null;
    node = node.children[seg];
  }
  return node;
}

// `~` or `~/projects`, for the prompt.
export function displayPath(segs) {
  return ['~', ...segs].join('/');
}

// `/home/prajan/projects`, for pwd.
export function absolutePath(segs) {
  return [HOME, ...segs].join('/');
}

// Directory entries, directories first, each `{ name, type }`.
export function listDir(node, { all = false } = {}) {
  return Object.entries(node.children)
    .filter(([name]) => all || !name.startsWith('.'))
    .map(([name, child]) => ({ name, type: child.type }))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
}

// Tab-completion candidates for a partial path like `proj` or `projects/se`.
// Returns full replacement tokens (directories end in `/`).
export function completePath(root, cwd, partial, { dirsOnly = false } = {}) {
  const slash = partial.lastIndexOf('/');
  const base = slash === -1 ? '' : partial.slice(0, slash + 1);
  const prefix = partial.slice(slash + 1);
  const parent = getNode(root, base ? resolvePath(cwd, base) : cwd);
  if (parent?.type !== 'dir') return [];

  return listDir(parent, { all: prefix.startsWith('.') })
    .filter((e) => e.name.startsWith(prefix) && (!dirsOnly || e.type === 'dir'))
    .map((e) => `${base}${e.name}${e.type === 'dir' ? '/' : ''}`);
}
