#!/usr/bin/env node
/**
 * @file Syncs src/data/projects.json from GitHub. Run by
 * .github/workflows/sync-projects.yml in two phases around the Claude step:
 *
 *   node scripts/sync-projects.mjs prepare   # fetch repos, write projects.json + .sync/
 *   node scripts/sync-projects.mjs finalize  # merge Claude's summaries (SUMMARIES_JSON)
 *
 * Env: GITHUB_TOKEN (required for prepare), GITHUB_USERNAME (defaults to the repo owner).
 * @module scripts/sync-projects
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  MANIFEST_NAMES,
  applySummaries,
  buildTech,
  deriveStatus,
  mainLanguages,
  planProjects,
  selectRepos,
  techFromManifest,
} from './sync/core.mjs';

const ROOT = process.cwd();
const PROJECTS_FILE = path.join(ROOT, 'src/data/projects.json');
const SYNC_DIR = path.join(ROOT, '.sync');
const STATE_FILE = path.join(SYNC_DIR, 'state.json');
const README_DIR = path.join(SYNC_DIR, 'readmes');

const API = process.env.GITHUB_API_URL || 'https://api.github.com';
const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME || process.env.GITHUB_REPOSITORY_OWNER;
// The portfolio site itself never lists itself.
const SELF_REPO = (process.env.GITHUB_REPOSITORY ?? '/PortfolioWebsite').split('/')[1];

const MAX_MANIFESTS = 8;
const SKIP_DIRS = /(^|\/)(node_modules|vendor|examples?|test|tests|dist|build)\//;

/* ── GitHub API ── */

async function gh(url, init = {}) {
  const res = await fetch(url.startsWith('http') ? url : `${API}${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...init.headers,
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${url}: ${await res.text()}`);
  return res.json();
}

const REPO_FIELDS = `
  name owner { login } url homepageUrl description
  isFork isArchived isPrivate pushedAt
  defaultBranchRef { name }
  latestRelease { tagName }
  languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } }
`;

// Pinned repos (in profile order) and owned repos tagged `portfolio`.
async function fetchRepoList() {
  const query = `query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { ${REPO_FIELDS} } } }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes { ${REPO_FIELDS} repositoryTopics(first: 20) { nodes { topic { name } } } }
      }
    }
  }`;
  const body = await gh('/graphql', {
    method: 'POST',
    body: JSON.stringify({ query, variables: { login: USERNAME } }),
  });
  if (body.errors?.length) throw new Error(`GraphQL: ${JSON.stringify(body.errors)}`);
  if (!body.data.user) throw new Error(`GitHub user "${USERNAME}" not found`);

  const { pinnedItems, repositories } = body.data.user;
  const tagged = repositories.nodes.filter((r) =>
    r.repositoryTopics.nodes.some((t) => t.topic.name === 'portfolio'),
  );
  // Private repos are skipped so nothing private is ever published.
  return selectRepos(pinnedItems.nodes, tagged, SELF_REPO).filter((r) => !r.isPrivate);
}

async function fetchReadme(owner, name) {
  const data = await gh(`/repos/${owner}/${name}/readme`);
  if (!data) return null;
  return { sha: data.sha, text: Buffer.from(data.content, 'base64').toString('utf-8') };
}

// Frameworks declared in manifests at the repo root or one folder deep
// (covers frontend/ + backend/ layouts).
async function fetchFrameworks(owner, name, branch) {
  if (!branch) return [];
  const tree = await gh(`/repos/${owner}/${name}/git/trees/${branch}?recursive=1`);
  if (!tree) return [];

  const manifests = tree.tree
    .filter((e) => e.type === 'blob' && e.path.split('/').length <= 2 && !SKIP_DIRS.test(e.path))
    .filter((e) => MANIFEST_NAMES.has(path.posix.basename(e.path)))
    .slice(0, MAX_MANIFESTS);

  const found = [];
  for (const m of manifests) {
    const blob = await gh(`/repos/${owner}/${name}/git/blobs/${m.sha}`);
    if (!blob) continue;
    const text = Buffer.from(blob.content, 'base64').toString('utf-8');
    found.push(...techFromManifest(path.posix.basename(m.path), text));
  }
  return found;
}

async function collectFacts(repo) {
  const owner = repo.owner.login;
  const [readme, frameworks] = await Promise.all([
    fetchReadme(owner, repo.name),
    fetchFrameworks(owner, repo.name, repo.defaultBranchRef?.name),
  ]);
  const languages = mainLanguages(
    repo.languages.edges.map((e) => ({ name: e.node.name, size: e.size })),
  );
  const homepage = repo.homepageUrl?.trim() || null;

  return {
    id: repo.name,
    github: repo.url,
    homepage,
    description: repo.description ?? '',
    tech: buildTech(frameworks, languages),
    status: deriveStatus({ hasRelease: Boolean(repo.latestRelease), homepage, pushedAt: repo.pushedAt }),
    readmeSha: readme?.sha ?? null,
    readme: readme?.text ?? null,
  };
}

/* ── Files ── */

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function setOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

/* ── Phases ── */

async function prepare() {
  if (!TOKEN || !USERNAME) throw new Error('GITHUB_TOKEN and GITHUB_USERNAME are required');

  const repos = await fetchRepoList();
  const facts = [];
  for (const repo of repos) facts.push(await collectFacts(repo));

  const { projects, pending } = planProjects(facts, readJson(PROJECTS_FILE, []));
  writeJson(PROJECTS_FILE, projects);

  fs.rmSync(SYNC_DIR, { recursive: true, force: true });
  fs.mkdirSync(README_DIR, { recursive: true });
  const readmeShas = {};
  for (const f of facts.filter((f) => pending.includes(f.id))) {
    readmeShas[f.id] = f.readmeSha;
    fs.writeFileSync(path.join(README_DIR, `${f.id}.md`), f.readme);
  }
  writeJson(STATE_FILE, { pending, readmeShas });

  console.log(`Synced ${projects.length} project(s): ${projects.map((p) => p.id).join(', ') || 'none'}`);
  console.log(`Needs summary: ${pending.join(', ') || 'none'}`);
  setOutput('pending_count', pending.length);
  setOutput('pending', pending.join(' '));
}

function finalize() {
  const { pending, readmeShas } = readJson(STATE_FILE, { pending: [], readmeShas: {} });
  if (pending.length === 0) return;

  let summaries = [];
  try {
    summaries = JSON.parse(process.env.SUMMARIES_JSON || '{}').projects ?? [];
  } catch (error) {
    console.log(`::warning::Could not parse Claude's output: ${error.message}`);
  }

  const { projects, errors } = applySummaries(readJson(PROJECTS_FILE, []), readmeShas, pending, summaries);
  writeJson(PROJECTS_FILE, projects);

  // Rejected entries keep their fallback text and are retried on the next run.
  errors.forEach((e) => console.log(`::warning::Summary rejected for ${e}`));
  console.log(`Applied ${pending.length - errors.length}/${pending.length} summaries`);
}

const phase = process.argv[2];
if (phase === 'prepare') await prepare();
else if (phase === 'finalize') finalize();
else {
  console.error('Usage: node scripts/sync-projects.mjs <prepare|finalize>');
  process.exit(1);
}
