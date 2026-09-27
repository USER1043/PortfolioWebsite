/**
 * @file Pure helpers for the project sync — no network or filesystem access,
 * so every rule here is unit-testable.
 * @module scripts/sync/core
 */

// Languages that describe tooling or markup rather than what a project is built with.
const IGNORED_LANGUAGES = new Set([
  'HTML', 'CSS', 'SCSS', 'Sass', 'Less', 'Shell', 'PowerShell', 'Batchfile',
  'Dockerfile', 'Makefile', 'Procfile', 'Nix', 'Jupyter Notebook',
]);

// Share of a repo's code (by bytes) a language needs to be listed.
const MIN_LANGUAGE_SHARE = 0.1;
const MAX_LANGUAGES = 3;
const MAX_TECH = 6;

// Dependency name → display label, per manifest type.
const NPM_TECH = {
  react: 'React',
  next: 'Next.js',
  vue: 'Vue',
  svelte: 'Svelte',
  astro: 'Astro',
  '@angular/core': 'Angular',
  express: 'Express',
  mongoose: 'MongoDB',
  mongodb: 'MongoDB',
  pg: 'PostgreSQL',
  '@prisma/client': 'Prisma',
  redux: 'Redux',
  '@reduxjs/toolkit': 'Redux',
  'socket.io': 'Socket.IO',
  tailwindcss: 'Tailwind CSS',
  electron: 'Electron',
  three: 'Three.js',
  '@tauri-apps/api': 'Tauri',
  '@google/generative-ai': 'Gemini AI',
  '@google/genai': 'Gemini AI',
  openai: 'OpenAI',
  '@anthropic-ai/sdk': 'Claude API',
};

const CARGO_TECH = {
  tauri: 'Tauri',
  'actix-web': 'Actix Web',
  axum: 'Axum',
  tokio: 'Tokio',
  rocket: 'Rocket',
};

const PYTHON_TECH = {
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  torch: 'PyTorch',
  tensorflow: 'TensorFlow',
  streamlit: 'Streamlit',
  langchain: 'LangChain',
};

const GO_TECH = {
  'github.com/gin-gonic/gin': 'Gin',
  'github.com/gofiber/fiber': 'Fiber',
};

// Manifest file names the sync fetches and parses.
export const MANIFEST_NAMES = new Set([
  'package.json', 'Cargo.toml', 'requirements.txt', 'pyproject.toml', 'go.mod',
]);

// Returns the frameworks/libraries a manifest declares, as display labels.
export function techFromManifest(fileName, text) {
  const found = [];
  const add = (table, dep) => {
    const label = table[dep.toLowerCase()];
    if (label) found.push(label);
  };

  if (fileName === 'package.json') {
    let pkg;
    try {
      pkg = JSON.parse(text);
    } catch {
      return [];
    }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    Object.keys(deps).forEach((dep) => add(NPM_TECH, dep));
  } else if (fileName === 'Cargo.toml') {
    // Dependency keys look like `tauri = "2"` or `tauri = { version = ... }`.
    for (const match of text.matchAll(/^\s*([A-Za-z0-9_-]+)\s*=/gm)) add(CARGO_TECH, match[1]);
  } else if (fileName === 'requirements.txt' || fileName === 'pyproject.toml') {
    for (const match of text.matchAll(/^[\s"']*([A-Za-z0-9_.-]+)/gm)) add(PYTHON_TECH, match[1]);
  } else if (fileName === 'go.mod') {
    for (const match of text.matchAll(/^\s*(?:require\s+)?(\S+)\s+v\d/gm)) {
      const label = GO_TECH[match[1]];
      if (label) found.push(label);
    }
  }

  return found;
}

// Returns the main languages of a repo from GitHub's byte counts.
export function mainLanguages(languages) {
  const total = languages.reduce((sum, l) => sum + l.size, 0);
  if (total === 0) return [];
  const meaningful = languages
    .filter((l) => !IGNORED_LANGUAGES.has(l.name) && l.size / total >= MIN_LANGUAGE_SHARE)
    .sort((a, b) => b.size - a.size)
    .map((l) => l.name);
  // A pure HTML/CSS site still deserves a label.
  if (meaningful.length === 0) return [languages.sort((a, b) => b.size - a.size)[0].name];
  return meaningful.slice(0, MAX_LANGUAGES);
}

// Combines detected frameworks and languages into the displayed tech list.
export function buildTech(frameworks, languages) {
  let tech = [...new Set(frameworks)];

  // React + Express + MongoDB reads better as the stack name.
  const mern = ['React', 'Express', 'MongoDB'];
  if (mern.every((t) => tech.includes(t))) {
    tech = ['MERN Stack', ...tech.filter((t) => !mern.includes(t))];
    languages = languages.filter((l) => l !== 'JavaScript');
  }

  return [...new Set([...tech, ...languages])].slice(0, MAX_TECH);
}

// Derives a status label from repo activity.
export function deriveStatus({ hasRelease, homepage, pushedAt }, now = new Date()) {
  if (hasRelease) return 'Shipped ✓';
  if (homepage) return 'Live';
  const ageDays = (now.getTime() - new Date(pushedAt).getTime()) / 86_400_000;
  return ageDays <= 90 ? 'Active' : 'Paused';
}

// Turns `my_cool-repo` into `My Cool Repo` as a last-resort display name.
export function prettifyRepoName(repo) {
  return repo
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

// Keeps pinned order first, then `portfolio`-topic repos; drops forks, archived
// repos, duplicates and the excluded repo (the portfolio site itself).
export function selectRepos(pinned, topicRepos, exclude) {
  const seen = new Set();
  const skip = (exclude ?? '').toLowerCase();
  return [...pinned, ...topicRepos].filter((r) => {
    const key = r.name.toLowerCase();
    if (r.isFork || r.isArchived || key === skip || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Builds the next projects.json from fresh repo facts and the previous file.
// Text written by Claude is carried over while the README is unchanged; repos
// whose README changed (or that are new) are returned in `pending`.
export function planProjects(facts, previous) {
  const prevById = new Map(previous.map((p) => [p.id, p]));
  const pending = [];

  const projects = facts.map((f, order) => {
    const prev = prevById.get(f.id);
    const fresh = prev && prev.readmeSha === f.readmeSha && f.readmeSha && prev.summary;
    if (!fresh && f.readme) pending.push(f.id);

    return {
      id: f.id,
      name: fresh ? prev.name : prev?.name ?? prettifyRepoName(f.id),
      github: f.github,
      ...(f.homepage ? { demo: f.homepage } : {}),
      tech: f.tech,
      status: f.status,
      summary: fresh ? prev.summary : prev?.summary || f.description || '',
      ...(fresh && prev.whyItMatters ? { whyItMatters: prev.whyItMatters } : {}),
      // Only recorded once Claude has summarised this README version.
      readmeSha: fresh ? f.readmeSha : null,
      order,
    };
  });

  return { projects, pending };
}

const SUMMARY_MAX = 280;
const WHY_MAX = 400;
const NAME_MAX = 40;

// Validates one generated blurb; returns an error string or null.
export function checkSummary(s) {
  if (!s || typeof s !== 'object') return 'not an object';
  if (typeof s.name !== 'string' || !s.name.trim() || s.name.length > NAME_MAX) return 'bad name';
  if (typeof s.summary !== 'string' || !s.summary.trim() || s.summary.length > SUMMARY_MAX) return 'bad summary';
  if (typeof s.whyItMatters !== 'string' || !s.whyItMatters.trim() || s.whyItMatters.length > WHY_MAX) return 'bad whyItMatters';
  return null;
}

// Merges Claude's blurbs into the planned projects. Only the text fields of
// pending repos can change; everything else stays exactly as planned.
export function applySummaries(planned, readmeShas, pending, summaries) {
  const byId = new Map((summaries ?? []).map((s) => [s.repo, s]));
  const errors = [];

  const projects = planned.map((p) => {
    if (!pending.includes(p.id)) return p;
    const s = byId.get(p.id);
    const error = s ? checkSummary(s) : 'missing';
    if (error) {
      errors.push(`${p.id}: ${error}`);
      return p;
    }
    return {
      ...p,
      name: s.name.trim(),
      summary: s.summary.trim(),
      whyItMatters: s.whyItMatters.trim(),
      readmeSha: readmeShas[p.id],
    };
  });

  return { projects, errors };
}
