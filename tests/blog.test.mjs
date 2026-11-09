import test from "node:test";
import assert from "node:assert/strict";
import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";
import { calloutsPlugin } from "../src/lib/blog/callouts.mjs";
import { countWords, isoDay, readingMinutes, sortPosts } from "../src/lib/blog/util.mjs";

// The same Markdown pipeline astro.config.mjs sets up.
const processor = await createSatteriMarkdownProcessor({
  syntaxHighlight: "shiki",
  shikiConfig: { theme: "css-variables" },
  hastPlugins: [calloutsPlugin],
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
