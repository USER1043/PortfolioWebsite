import test from "node:test";
import assert from "node:assert/strict";
import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";
import { calloutsPlugin } from "../src/lib/blog/callouts.mjs";
import { labelListsPlugin } from "../src/lib/blog/labelLists.mjs";
import { buildRss, countWords, escXml, isoDay, readingMinutes, sortPosts, tagCounts, tocTree } from "../src/lib/blog/util.mjs";

// The same Markdown pipeline astro.config.mjs sets up.
const processor = await createSatteriMarkdownProcessor({
  syntaxHighlight: "shiki",
  shikiConfig: { theme: "css-variables" },
  hastPlugins: [calloutsPlugin, labelListsPlugin],
});
const render = async (md) => (await processor.render(md)).code;

/* ── callouts ── */

test("a marker on its own line becomes a labelled callout", async () => {
  const html = await render("> [!WARN]\n> Config moves the *fragility*.");
  assert.match(html, /<aside class="callout callout--warn" role="note">/);
  assert.match(html, /<span class="callout-label">\[WARN\]<\/span>/);
  assert.match(html, /<div class="callout-body"><p>Config moves the <em>fragility<\/em>.<\/p><\/div>/);
  assert.doesNotMatch(html, /\[!WARN\]|<blockquote/);
});

test("a marker can share the line with its text", async () => {
  const html = await render("> [!OK] Debugging became one query.");
  assert.match(html, /callout--ok/);
  assert.match(html, /\[ OK \]/);
  assert.match(html, /<p>Debugging became one query.<\/p>/);
});

test("markers are case-insensitive and GitHub alert names work", async () => {
  for (const [marker, kind, label] of [
    ["note", "info", "[INFO]"],
    ["INFO", "info", "[INFO]"],
    ["Tip", "tip", "[TIP]"],
    ["WARNING", "warn", "[WARN]"],
    ["CAUTION", "warn", "[WARN]"],
    ["success", "ok", "[ OK ]"],
  ]) {
    const html = await render(`> [!${marker}]\n> text`);
    assert.match(html, new RegExp(`callout--${kind}`), marker);
    assert.ok(html.includes(label), marker);
  }
});

test("a blank line after the marker leaves no empty paragraph", async () => {
  const html = await render("> [!NOTE]\n>\n> First.\n>\n> Second.");
  assert.doesNotMatch(html, /<p>\s*<\/p>/);
  assert.match(html, /<p>First.<\/p>\s*<p>Second.<\/p>/);
});

test("plain quotes and unknown markers stay quotes", async () => {
  assert.match(await render("> Just a quote."), /<blockquote>/);
  const unknown = await render("> [!BANANA]\n> text");
  assert.match(unknown, /<blockquote>/);
  assert.match(unknown, /\[!BANANA\]/);
});

test("code blocks are highlighted with theme variables", async () => {
  const html = await render("```js\nconst a = 'x';\n```");
  assert.match(html, /var\(--astro-code-token-/);
  assert.match(html, /background-color:var\(--astro-code-background\)/);
});

/* ── word count and reading time ── */

test("counts prose words and skips code, URLs and markup", () => {
  assert.equal(countWords("Hello world, it's me."), 4);
  assert.equal(countWords("## Intro\n\nOne two three."), 4);
  assert.equal(countWords("See [the repo](https://github.com/u/a-very-long-url) now."), 4);
  assert.equal(countWords("Before.\n\n```js\nconst lots = of + code;\n```\n\nAfter."), 2);
  assert.equal(countWords("![a diagram](/blog/x.png) Text."), 1);
  assert.equal(countWords("> [!WARN]\n> Careful here."), 2);
  assert.equal(countWords("<div>One</div> two"), 2);
  assert.equal(countWords(""), 0);
});

test("reading time is whole minutes, at least one", () => {
  assert.equal(readingMinutes(0), 1);
  assert.equal(readingMinutes(100), 1);
  assert.equal(readingMinutes(1840), 8);
  assert.equal(readingMinutes(660, 220), 3);
});

test("dates print as the UTC day", () => {
  assert.equal(isoDay(new Date("2026-11-09")), "2026-11-09");
  assert.equal(isoDay(new Date("2026-11-09T23:30:00Z")), "2026-11-09");
});

test("posts sort newest first, then by slug", () => {
  const posts = [
    { slug: "b", date: new Date("2026-01-01") },
    { slug: "c", date: new Date("2026-03-01") },
    { slug: "a", date: new Date("2026-01-01") },
  ];
  assert.deepEqual(sortPosts(posts).map((p) => p.slug), ["c", "a", "b"]);
  assert.deepEqual(posts.map((p) => p.slug), ["b", "c", "a"], "does not mutate");
});

/* ── labelled lists ── */

test("a list of bold labels becomes a definition list", async () => {
  const html = await render("- **Why:** adding a file, no `deploy`.\n- **Trade-off:** selectors break.");
  assert.match(html, /<dl class="label-list">/);
  assert.match(html, /<dt>why<\/dt><dd>adding a file, no <code>deploy<\/code>.<\/dd>/);
  assert.match(html, /<dt>trade-off<\/dt><dd>selectors break.<\/dd>/);
  assert.doesNotMatch(html, /<ul>|<strong>/);
});

test("loose labelled lists work too", async () => {
  const html = await render("- **Why:** one.\n\n- **Cost:** two.");
  assert.match(html, /<dt>why<\/dt><dd>one.<\/dd>/);
  assert.match(html, /<dt>cost<\/dt><dd>two.<\/dd>/);
});

test("ordinary lists stay lists", async () => {
  for (const md of [
    "- **Why:** one.\n- plain item",          // one item unlabelled
    "- **Free tier**, so limited memory.\n- **27 companies**.", // bold but no colon
    "- **Why:** only one item",
    "- **Why:**\n- **How:**",                   // labels with nothing after them
  ]) {
    const html = await render(md);
    assert.match(html, /<ul>/, md);
    assert.doesNotMatch(html, /label-list/, md);
  }
});

/* ── table of contents ── */

const h = (depth, text) => ({ depth, text, slug: text.toLowerCase() });

test("contents are drawn like `tree` output", () => {
  const rows = tocTree([
    h(2, "Intro"), h(2, "Problem"), h(3, "Limits"), h(3, "Done"),
    h(2, "Approach"), h(3, "Config"), h(2, "End"), h(4, "Ignored"),
  ]);
  assert.deepEqual(rows.map((r) => r.prefix + r.text), [
    "├── Intro",
    "├── Problem",
    "│   ├── Limits",
    "│   └── Done",
    "├── Approach",
    "│   └── Config",
    "└── End",
  ]);
});

test("subsections of the last section get no trunk line", () => {
  const rows = tocTree([h(2, "A"), h(2, "B"), h(3, "B1"), h(3, "B2")]);
  assert.deepEqual(rows.map((r) => r.prefix + r.text), ["├── A", "└── B", "    ├── B1", "    └── B2"]);
});

test("subsections before any section are shown as sections", () => {
  const rows = tocTree([h(3, "Early"), h(2, "Main"), h(3, "Sub")]);
  assert.deepEqual(rows.map((r) => r.prefix + r.text), ["├── Early", "└── Main", "    └── Sub"]);
  assert.deepEqual(tocTree([]), []);
});

/* ── tags and RSS ── */

test("tags are counted, most used first, then A–Z", () => {
  const posts = [{ tags: ["rust", "cli"] }, { tags: ["rust"] }, { tags: ["ai", "cli"] }, { tags: [] }];
  assert.deepEqual(tagCounts(posts), [
    { tag: "cli", count: 2 }, { tag: "rust", count: 2 }, { tag: "ai", count: 1 },
  ]);
  assert.deepEqual(tagCounts([]), []);
});

test("the RSS feed lists posts with absolute links and escaped text", () => {
  const xml = buildRss({
    site: new URL("https://example.dev"),
    title: "Writing",
    description: "Notes & ideas",
    posts: [
      { slug: "b", title: "Rust <3 & Tauri", description: 'He said "hi"', date: new Date("2026-11-15"), tags: ["rust"] },
      { slug: "a", title: "Older", description: "x", date: new Date("2026-09-03"), updated: new Date("2026-12-01"), tags: [] },
    ],
  });
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<rss version="2.0"/);
  assert.match(xml, /<description>Notes &amp; ideas<\/description>/);
  assert.match(xml, /<title>Rust &lt;3 &amp; Tauri<\/title>/);
  assert.match(xml, /<description>He said &quot;hi&quot;<\/description>/);
  assert.match(xml, /<link>https:\/\/example.dev\/blog\/b\/<\/link>/);
  assert.match(xml, /<guid isPermaLink="true">https:\/\/example.dev\/blog\/a\/<\/guid>/);
  assert.match(xml, /<pubDate>Sun, 15 Nov 2026 00:00:00 GMT<\/pubDate>/);
  assert.match(xml, /<category>rust<\/category>/);
  assert.match(xml, /<lastBuildDate>Tue, 01 Dec 2026 00:00:00 GMT<\/lastBuildDate>/, "newest date across all posts");
  assert.ok(xml.indexOf("/blog/b/") < xml.indexOf("/blog/a/"), "keeps the given order");
});

test("an empty feed is still valid", () => {
  const xml = buildRss({ site: "https://example.dev", title: "W", description: "D", posts: [] });
  assert.doesNotMatch(xml, /<item>|lastBuildDate/);
  assert.match(xml, /<\/channel>\n<\/rss>\n$/);
  assert.equal(escXml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&apos;&amp;&apos;&lt;/a&gt;");
});
