import test from "node:test";
import assert from "node:assert/strict";
import { buildRegistry } from "../src/lib/terminal/commands/index.js";
import { artToHtml, fakeHash, neofetchInfo, timelineCommits } from "../src/lib/terminal/commands/shell.js";
import { commonPrefix, completeInput } from "../src/lib/terminal/complete.js";
import { parseInput } from "../src/lib/terminal/parse.js";
import { GROUPS, createRegistry } from "../src/lib/terminal/registry.js";
import { editDistance, suggest } from "../src/lib/terminal/suggest.js";
import { escHtml, formatDuration } from "../src/lib/terminal/util.js";
import {
  absolutePath, buildFs, completePath, displayPath, getNode, listDir, resolvePath, slugify,
} from "../src/lib/terminal/vfs.js";

const PROJECTS = [
  { id: "pp", name: "PasswordPal", tech: ["Rust", "Tauri"], status: "Shipped ✓", summary: "Vault.", github: "https://github.com/u/pp" },
  { id: "ss", name: "Sensory Safari", tech: ["React"], status: "Live", summary: "Animals.", whyItMatters: "Accessible.", demo: "https://ss.app" },
];

// Records what commands print, instead of touching the DOM.
class FakeRenderer {
  constructor() { this.out = []; }
  line(text, cls) { this.out.push({ text, cls }); }
  html(markup, cls) { this.out.push({ html: markup, cls }); }
  blank() {}
  get text() { return this.out.map((o) => o.text ?? o.html).join("\n"); }
}

async function run(raw, { cwd = [], timeline = [] } = {}) {
  const registry = buildRegistry();
  const calls = { opened: [], cwd: null };
  const ctx = {
    r: new FakeRenderer(),
    registry,
    projects: PROJECTS,
    fs: buildFs(PROJECTS),
    shell: { cwd },
    timeline,
    art: { rows: [[["▀", "#ff0000", "#00ff00"], "  "]] },
    startedAt: Date.now() - 65_000,
    history: [],
    actions: {
      setCwd: (segs) => { calls.cwd = segs; },
      openUrl: (url) => calls.opened.push(url),
      navigate: (url) => calls.opened.push(url),
      clear: async () => {},
      exit: async () => {},
    },
  };
  const input = parseInput(raw);
  await registry.find(input.name).run(ctx, input);
  return { text: ctx.r.text, out: ctx.r.out, ctx, calls };
}

/* ── pure helpers ── */

test("parses names case-insensitively and keeps argument case", () => {
  assert.deepEqual(parseInput("  CAT  About.txt  "), { name: "cat", args: ["About.txt"], rest: "About.txt" });
  assert.deepEqual(parseInput("echo  hi   there"), { name: "echo", args: ["hi", "there"], rest: "hi   there" });
  assert.deepEqual(parseInput("   "), { name: "", args: [], rest: "" });
});

test("suggests the closest command within two edits", () => {
  assert.equal(editDistance("projcts", "projects"), 1);
  assert.equal(suggest("projcts", ["projects", "help"]), "projects");
  assert.equal(suggest("hlep", ["help", "history"]), "help");
  assert.equal(suggest("banana", ["help", "projects"]), null);
});

test("formats durations and escapes HTML", () => {
  assert.equal(formatDuration(0), "0 secs");
  assert.equal(formatDuration(65_000), "1 min, 5 secs");
  assert.equal(formatDuration(3_600_000), "1 hour");
  assert.equal(escHtml('<a href="x">&'), "&lt;a href=&quot;x&quot;&gt;&amp;");
});

/* ── virtual filesystem ── */

test("resolves paths without escaping home", () => {
  assert.deepEqual(resolvePath(["projects"], ".."), []);
  assert.deepEqual(resolvePath([], "../../.."), []);
  assert.deepEqual(resolvePath(["projects"], "~"), []);
  assert.deepEqual(resolvePath(["projects"], "/"), []);
  assert.deepEqual(resolvePath([], "/home/prajan/projects/"), ["projects"]);
  assert.deepEqual(resolvePath(["projects"], "./x.md"), ["projects", "x.md"]);
  assert.equal(displayPath(["projects"]), "~/projects");
  assert.equal(absolutePath(["projects"]), "/home/prajan/projects");
});

test("builds the filesystem from projects", () => {
  const fs = buildFs(PROJECTS);
  assert.equal(slugify("Sensory Safari"), "sensory-safari");
  assert.deepEqual(listDir(fs).map((e) => e.name), ["projects", "about.txt", "contact.txt", "resume.pdf"]);
  const ss = getNode(fs, ["projects", "sensory-safari.md"]);
  assert.equal(ss.url, "https://ss.app"); // demo wins over GitHub
  assert.equal(getNode(fs, ["projects", "passwordpal.md"]).url, "https://github.com/u/pp");
  assert.equal(getNode(fs, ["nope"]), null);
  assert.equal(getNode(fs, ["about.txt", "x"]), null);
});

test("completes paths, optionally directories only", () => {
  const fs = buildFs(PROJECTS);
  assert.deepEqual(completePath(fs, [], "pro"), ["projects/"]);
  assert.deepEqual(completePath(fs, [], "projects/s"), ["projects/sensory-safari.md"]);
  assert.deepEqual(completePath(fs, [], "", { dirsOnly: true }), ["projects/"]);
  assert.deepEqual(completePath(fs, ["projects"], "../ab"), ["../about.txt"]);
});

/* ── registry & completion ── */

test("registry rejects duplicate names and aliases", () => {
  assert.throws(() => createRegistry([{ name: "a" }, { name: "b", aliases: ["a"] }]), /Duplicate/);
});

test("every visible command is documented and grouped", () => {
  const groups = new Set(GROUPS.map(([g]) => g));
  for (const c of buildRegistry().visible()) {
    assert.ok(c.description, `${c.name} needs a description`);
    assert.ok(groups.has(c.group), `${c.name} has unknown group ${c.group}`);
  }
});

test("tab completion never offers hidden commands", () => {
  const registry = createRegistry([
    { name: "help", group: "session", description: "x" },
    { name: "hello", group: "session", description: "x", hidden: true },
    { name: "history", group: "session", description: "x" },
  ]);
  const ctx = { registry, fs: buildFs([]), cwd: [] };
  assert.deepEqual(completeInput("hel", ctx), { value: "help ", matches: [] });
  assert.deepEqual(completeInput("h", ctx), { value: "h", matches: ["help", "history"] });
  assert.equal(commonPrefix(["history", "hist"]), "hist");
});

test("tab completion fills paths for path commands only", () => {
  const ctx = { registry: buildRegistry(), fs: buildFs(PROJECTS), cwd: [] };
  assert.equal(completeInput("cd pro", ctx).value, "cd projects/");
  assert.equal(completeInput("cat ab", ctx).value, "cat about.txt ");
  assert.equal(completeInput("cd ab", ctx).value, "cd ab"); // cd only completes directories
  assert.equal(completeInput("echo ab", ctx).value, "echo ab"); // echo takes no paths
});

/* ── commands ── */

test("help lists every visible command and the shortcuts", async () => {
  const { text } = await run("help");
  for (const name of buildRegistry().visibleNames()) assert.match(text, new RegExp(`>${name}\\s*<`));
  assert.match(text, /Tab completes/);
});

test("ls lists home and projects; -a and -l work", async () => {
  assert.match((await run("ls")).text, /projects\/<\/span>.*about\.txt.*resume\.pdf/);
  const { text } = await run("ls projects");
  assert.match(text, /passwordpal\.md/);
  assert.match(text, /sensory-safari\.md/);
  assert.match((await run("ls -l")).text, /drwxr-xr-x/);
  assert.match((await run("ls nope")).text, /No such file or directory/);
});

test("cd changes directory and updates the prompt", async () => {
  const { ctx, calls } = await run("cd projects");
  assert.deepEqual(ctx.shell.cwd, ["projects"]);
  assert.deepEqual(calls.cwd, ["projects"]);
  assert.match((await run("cd about.txt")).text, /Not a directory/);
  assert.deepEqual((await run("cd", { cwd: ["projects"] })).ctx.shell.cwd, []);
  assert.match((await run("pwd", { cwd: ["projects"] })).text, /^\/home\/prajan\/projects$/);
});

test("cat prints files and explains errors", async () => {
  const project = await run("cat sensory-safari.md", { cwd: ["projects"] });
  assert.match(project.text, /# Sensory Safari/);
  assert.match(project.text, /Accessible\./);
  assert.match((await run("cat about.txt")).text, /CS undergrad/);
  assert.match((await run("cat contact.txt")).text, /\/contact/);
  assert.match((await run("cat resume.pdf")).text, /binary file — try: open resume\.pdf/);
  assert.match((await run("cat projects")).text, /Is a directory/);
  assert.match((await run("cat")).text, /missing file operand/);
});

test("open opens real links and refuses plain text files", async () => {
  assert.deepEqual((await run("open resume.pdf")).calls.opened, ["/Resume.pdf"]);
  assert.deepEqual((await run("open projects")).calls.opened, ["/projects"]);
  assert.deepEqual((await run("contact")).calls.opened, ["/contact"]);
  const about = await run("open about.txt");
  assert.deepEqual(about.calls.opened, []);
  assert.match(about.text, /try: cat about\.txt/);
});

test("git log shows dated milestones newest first", async () => {
  const timeline = [
    { date: "2024-05", message: "older" },
    { message: "undated, skipped" },
    { date: "2026-01", message: "newer" },
  ];
  const commits = timelineCommits(timeline);
  assert.deepEqual(commits.map((c) => c.message), ["newer", "older"]);
  assert.equal(commits[0].date, "Jan 2026");
  assert.match(commits[0].hash, /^[0-9a-f]{7}$/);
  assert.equal(fakeHash("newer"), commits[0].hash); // stable across renders

  const log = await run("git log", { timeline });
  assert.match(log.text, /HEAD -&gt; main/);
  assert.match((await run("git log --oneline", { timeline })).text, /newer\n.*older/);
  assert.match((await run("git log")).text, /does not have any commits yet/);
  assert.match((await run("git status")).text, /working tree clean/);
  assert.match((await run("git push")).text, /usage: git log/);
});

test("neofetch shows art, live counts and is escape-safe", async () => {
  const { text } = await run("neofetch");
  assert.match(text, /color:#ff0000;background:#00ff00/);
  assert.match(text, /Projects<\/span>: 2/);
  assert.match(text, /Uptime<\/span>: 1 min, 5 secs/);
  assert.equal(artToHtml({ rows: [[["x", "red;}</style>"]]] }), '<span style="">x</span>');
  assert.equal(neofetchInfo({ projects: [], startedAt: 0, now: 0 })[0][1], "prajan@portfolio");
});

test("echo, man and whoami behave like their namesakes", async () => {
  const echo = await run("echo <b>hi</b>");
  assert.equal(echo.out[0].text, "<b>hi</b>"); // printed as text, never HTML
  assert.match((await run("man ls")).text, /SYNOPSIS\n\s+ls \[-a\] \[-l\] \[path\]/);
  assert.match((await run("man nope")).text, /No manual entry for nope/);
  assert.match((await run("whoami")).text, /^prajan/);
});
