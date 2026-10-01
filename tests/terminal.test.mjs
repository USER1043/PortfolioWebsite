import test from "node:test";
import assert from "node:assert/strict";
import { buildRegistry } from "../src/lib/terminal/commands/index.js";
import { artToHtml, fakeHash, neofetchInfo, timelineCommits } from "../src/lib/terminal/commands/shell.js";
import { FORTUNES, bubble, coffeeBar, wrap } from "../src/lib/terminal/commands/fun.js";
import { KONAMI, createSequenceMatcher } from "../src/lib/terminal/konami.js";
import { DEFAULT_THEME, THEME_NAMES, isTheme } from "../src/lib/terminal/themes.js";
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
  line(text, cls) { const entry = { text, cls }; this.out.push(entry); return entry; }
  html(markup, cls) { this.out.push({ html: markup, cls }); }
  blank() {}
  get text() { return this.out.map((o) => o.text ?? o.html).join("\n"); }
}

async function run(raw, { cwd = [], timeline = [], shell, random = () => 0, reducedMotion = false, theme = DEFAULT_THEME } = {}) {
  const registry = buildRegistry();
  const calls = { opened: [], cwd: null, theme: null, matrix: 0 };
  const ctx = {
    r: new FakeRenderer(),
    registry,
    projects: PROJECTS,
    fs: buildFs(PROJECTS),
    shell: shell ?? { cwd },
    random,
    reducedMotion,
    theme,
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
      setTheme: (name) => { calls.theme = name; },
      getTheme: () => theme,
      matrix: async () => { calls.matrix++; },
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
  // A day orders same-month entries but only the month is shown.
  const sameMonth = timelineCommits([
    { date: "2026-01-05", message: "first" },
    { date: "2026-01-20", message: "second" },
  ]);
  assert.deepEqual(sameMonth.map((c) => [c.message, c.date]), [["second", "Jan 2026"], ["first", "Jan 2026"]]);
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

/* ── easter eggs (hidden) ── */

const HIDDEN = buildRegistry().all().filter((c) => c.hidden);

test("hidden commands stay out of help, completion and suggestions", async () => {
  assert.ok(HIDDEN.length >= 10);
  const { text } = await run("help");
  assert.match(text, /psst… not every command is listed here/);
  for (const c of HIDDEN) {
    assert.doesNotMatch(text, new RegExp(`>${c.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<`), c.name);
  }
  const ctx = { registry: buildRegistry(), fs: buildFs(PROJECTS), cwd: [] };
  assert.equal(completeInput("su", ctx).value, "su"); // not "sudo "
  assert.equal(completeInput("fort", ctx).value, "fort");
  assert.equal(suggest("sudp", buildRegistry().visibleNames()), null);
});

test("sudo and make", async () => {
  assert.match((await run("sudo ls")).text, /visitor is not in the sudoers file/);
  assert.equal((await run("sudo make me a sandwich")).out.at(-1).text, "Okay.");
  assert.match((await run("make me a sandwich")).text, /Make it yourself/);
  assert.match((await run("sudo rm -rf /")).text, /nice try/);
  assert.match((await run("sudo")).text, /usage: sudo/);
  assert.match((await run("make all")).text, /No targets specified/);
});

test("rm -rf / melts down (jokingly); other rm calls are read-only", async () => {
  const meltdown = await run("rm -rf /");
  assert.match(meltdown.text, /removed '\/home\/prajan\/about\.txt'/);
  assert.match(meltdown.text, /removed '\/home\/prajan\/projects\/passwordpal\.md'/);
  assert.match(meltdown.text, /just kidding/);
  assert.match((await run("rm -fr ~")).text, /just kidding/);
  assert.match((await run("rm -r -f *")).text, /just kidding/);
  assert.match((await run("rm about.txt")).text, /Read-only file system/);
  assert.match((await run("rm -rf about.txt")).text, /Read-only file system/);
  assert.match((await run("rm")).text, /missing operand/);
});

test("vim traps you until :q, and exit knows it", async () => {
  const shell = { cwd: [] };
  assert.match((await run("vim", { shell })).text, /you're in vim now/);
  assert.equal(shell.inVim, true);
  assert.match((await run("exit", { shell })).text, /still in vim\. try :q/);
  assert.match((await run(":wq", { shell })).text, /ahead of most developers/);
  assert.equal(shell.inVim, false);
  assert.match((await run(":q", { shell })).text, /not in vim\. relax/);
  assert.match((await run("emacs")).text, /lacking only a decent editor/);
  assert.match((await run("nano")).text, /person of culture/);
});

test("charizard-say wraps text and never renders HTML", async () => {
  assert.deepEqual(wrap("a ".repeat(30).trim(), 10), ["a a a a a", "a a a a a", "a a a a a", "a a a a a", "a a a a a", "a a a a a"]);
  assert.deepEqual(wrap("x".repeat(25), 10), ["xxxxxxxxxx", "xxxxxxxxxx", "xxxxx"]);
  assert.deepEqual(bubble("hi"), [" ____", "< hi >", " ----"]);
  const long = bubble("one two three four five six seven eight nine ten eleven twelve");
  assert.match(long[1], /^\/ /);
  assert.match(long.at(-2), /^\\ /);
  assert.ok(long.every((l) => l.length <= 44));

  const { out } = await run("charizard-say <b>hi</b>");
  assert.ok(out.some((o) => o.text === "< <b>hi</b> >"));
  assert.ok(out.every((o) => o.html === undefined)); // only textContent lines
  assert.match((await run("cowsay")).text, /< Rawr\. >/);
});

test("fortune, coffee, ping, hire and friends", async () => {
  assert.equal((await run("fortune", { random: () => 0 })).out[0].text, FORTUNES[0]);
  assert.equal((await run("fortune", { random: () => 0.9999 })).out[0].text, FORTUNES.at(-1));

  assert.equal(coffeeBar(4), "brewing [####······] 40%");
  const calm = await run("coffee", { reducedMotion: true });
  assert.deepEqual(calm.out.map((o) => o.text), ["☕ ready. back to shipping."]);

  assert.match((await run("ping")).text, /Destination address required/);
  assert.match((await run("ping prajan")).text, /online and caffeinated/);
  const pong = await run("ping example.com", { random: () => 0.5 });
  assert.match(pong.text, /icmp_seq=4 ttl=64 time=15\.00 ms/);
  assert.match(pong.text, /0% packet loss/);

  assert.match((await run("hire-me")).text, /mailto:/);
  assert.match((await run("hi")).text, /type help/);
  assert.match((await run("42")).text, /what was the question/);
});

test(".secrets only shows with ls -a and hints at the eggs", async () => {
  assert.doesNotMatch((await run("ls")).text, /\.secrets/);
  assert.match((await run("ls -a")).text, /\.secrets/);
  assert.match((await run("cat .secrets")).text, /editors are a trap/);
});

/* ── visual effects ── */

test("theme lists, switches and rejects unknown themes", async () => {
  assert.deepEqual(THEME_NAMES, ["mocha", "gruvbox", "dracula", "fire"]);
  assert.ok(isTheme("fire") && !isTheme("neon"));

  const list = await run("theme", { theme: "dracula" });
  for (const name of THEME_NAMES) assert.match(list.text, new RegExp(`>${name}\\s*<`));
  assert.match(list.text, /\*<\/span> <span class="t-cmd">dracula/); // current one is starred
  assert.match(list.text, /background:#FFA452/); // swatches preview each theme

  const set = await run("theme Fire");
  assert.equal(set.calls.theme, "fire");
  assert.match(set.text, /theme set to fire/);

  const bad = await run("theme neon");
  assert.equal(bad.calls.theme, null);
  assert.match(bad.text, /unknown theme 'neon'/);

  assert.match((await run("neofetch", { theme: "gruvbox" })).text, /Theme<\/span>: gruvbox/);
});

test("Tab completes theme names", () => {
  const ctx = { registry: buildRegistry(), fs: buildFs(PROJECTS), cwd: [] };
  assert.equal(completeInput("theme dr", ctx).value, "theme dracula ");
  assert.deepEqual(completeInput("theme ", ctx).matches, THEME_NAMES);
});

test("matrix is hidden and respects reduced motion", async () => {
  assert.ok(!buildRegistry().visibleNames().includes("matrix"));
  const rain = await run("matrix");
  assert.equal(rain.calls.matrix, 1);
  assert.match(rain.text, /wake up, neo…\n…you took the red pill/);

  const calm = await run("matrix", { reducedMotion: true });
  assert.equal(calm.calls.matrix, 0);
  assert.match(calm.text, /animations are off/);
});

test("the Konami matcher fires once per full sequence", () => {
  const feed = (keys) => {
    const match = createSequenceMatcher();
    return keys.map((k) => match(k));
  };
  assert.deepEqual(feed(KONAMI).filter(Boolean).length, 1);
  assert.equal(feed(KONAMI).at(-1), true);
  // A stray extra ↑ at the start still counts, and B/A are case-insensitive.
  const extraUp = ["ArrowUp", ...KONAMI.slice(0, -2), "B", "A"];
  assert.equal(feed(extraUp).at(-1), true);
  // A wrong key in the middle resets it.
  assert.equal(feed([...KONAMI.slice(0, 5), "x", ...KONAMI.slice(5)]).some(Boolean), false);
});

test(".secrets hints at the new eggs", async () => {
  const { text } = await run("cat .secrets");
  assert.match(text, /white rabbit/);
  assert.match(text, /cheat codes/);
});
