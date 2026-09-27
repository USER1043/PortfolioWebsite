import test from "node:test";
import assert from "node:assert/strict";
import {
  applySummaries,
  buildTech,
  deriveStatus,
  mainLanguages,
  planProjects,
  prettifyRepoName,
  selectRepos,
  techFromManifest,
} from "../scripts/sync/core.mjs";

test("detects frameworks from package.json and collapses MERN", () => {
  const pkg = JSON.stringify({
    dependencies: { react: "^19", express: "^5", mongoose: "^8" },
    devDependencies: { tailwindcss: "^4" },
  });
  const frameworks = techFromManifest("package.json", pkg);
  assert.deepEqual(buildTech(frameworks, ["JavaScript"]), ["MERN Stack", "Tailwind CSS"]);
});

test("detects Tauri from Cargo.toml and ignores malformed package.json", () => {
  const cargo = '[dependencies]\ntauri = { version = "2" }\nserde = "1"\n';
  assert.deepEqual(techFromManifest("Cargo.toml", cargo), ["Tauri"]);
  assert.deepEqual(techFromManifest("package.json", "{not json"), []);
});

test("keeps meaningful languages and drops markup below the threshold", () => {
  const langs = [
    { name: "Rust", size: 700 },
    { name: "TypeScript", size: 200 },
    { name: "CSS", size: 90 },
    { name: "Shell", size: 10 },
  ];
  assert.deepEqual(mainLanguages(langs), ["Rust", "TypeScript"]);
  assert.deepEqual(mainLanguages([{ name: "HTML", size: 5 }]), ["HTML"]);
  assert.deepEqual(mainLanguages([]), []);
});

test("derives status from releases, homepage and activity", () => {
  const now = new Date("2026-09-24T00:00:00Z");
  assert.equal(deriveStatus({ hasRelease: true, homepage: null, pushedAt: "2020-01-01" }, now), "Shipped ✓");
  assert.equal(deriveStatus({ hasRelease: false, homepage: "https://x.dev", pushedAt: "2020-01-01" }, now), "Live");
  assert.equal(deriveStatus({ hasRelease: false, homepage: null, pushedAt: "2026-09-01" }, now), "Active");
  assert.equal(deriveStatus({ hasRelease: false, homepage: null, pushedAt: "2025-01-01" }, now), "Paused");
});

test("selects pinned repos first and skips forks, archived, duplicates and itself", () => {
  const repo = (name, extra = {}) => ({ name, isFork: false, isArchived: false, ...extra });
  const selected = selectRepos(
    [repo("b"), repo("fork", { isFork: true }), repo("PortfolioWebsite")],
    [repo("a"), repo("B"), repo("old", { isArchived: true })],
    "PortfolioWebsite",
  );
  assert.deepEqual(selected.map((r) => r.name), ["b", "a"]);
});

test("prettifies repo names", () => {
  assert.equal(prettifyRepoName("passwordpal_frontend"), "Passwordpal Frontend");
});

const fact = (id, readmeSha, extra = {}) => ({
  id,
  github: `https://github.com/u/${id}`,
  homepage: null,
  description: `${id} description`,
  tech: ["Rust"],
  status: "Active",
  readmeSha,
  readme: readmeSha ? "# readme" : null,
  ...extra,
});

test("carries over summaries while the README is unchanged", () => {
  const previous = [
    { id: "keep", name: "Keep", summary: "Old", whyItMatters: "Why", readmeSha: "s1" },
    { id: "changed", name: "Changed", summary: "Stale", whyItMatters: "Why", readmeSha: "s1" },
  ];
  const { projects, pending } = planProjects(
    [fact("keep", "s1", { status: "Live" }), fact("changed", "s2"), fact("new", "s3"), fact("noreadme", null)],
    previous,
  );

  assert.deepEqual(pending, ["changed", "new"]);
  const [keep, changed, fresh, noreadme] = projects;
  assert.equal(keep.summary, "Old");
  assert.equal(keep.status, "Live"); // non-AI facts always refresh
  assert.equal(keep.readmeSha, "s1");
  assert.equal(changed.summary, "Stale"); // shown until the new summary lands
  assert.equal(changed.readmeSha, null);
  assert.equal(fresh.name, "New");
  assert.equal(fresh.summary, "new description");
  assert.equal(noreadme.summary, "noreadme description");
  assert.deepEqual(projects.map((p) => p.order), [0, 1, 2, 3]);
});

test("applies valid summaries only to pending repos and rejects bad ones", () => {
  const planned = [
    { id: "a", name: "A", summary: "x", readmeSha: null, tech: ["Rust"] },
    { id: "b", name: "B", summary: "y", readmeSha: null, tech: ["Go"] },
    { id: "c", name: "C", summary: "z", readmeSha: "s", tech: ["C"] },
    { id: "d", name: "Repo D", summary: "w", readmeSha: null, tech: ["Java"] },
  ];
  const summaries = [
    { repo: "a", name: "Alpha", summary: " Does A. ", whyItMatters: "Because." },
    { repo: "b", name: "B", summary: "", whyItMatters: "Because." },
    { repo: "c", name: "Hijack", summary: "Nope", whyItMatters: "Nope" },
    { repo: "d", name: "x".repeat(80), summary: "Does D.", whyItMatters: "Because." },
  ];
  const { projects, errors } = applySummaries(
    planned, { a: "sa", b: "sb", d: "sd" }, ["a", "b", "d"], summaries,
  );

  assert.deepEqual(projects[0], {
    id: "a", name: "Alpha", summary: "Does A.", whyItMatters: "Because.", readmeSha: "sa", tech: ["Rust"],
  });
  assert.deepEqual(projects[1], planned[1]); // rejected → unchanged, retried next run
  assert.deepEqual(projects[2], planned[2]); // not pending → untouchable
  assert.equal(projects[3].name, "Repo D"); // over-long name → keep the old one
  assert.equal(projects[3].summary, "Does D."); // ...but still use the summary
  assert.deepEqual(errors, ["b: bad summary"]);
});
