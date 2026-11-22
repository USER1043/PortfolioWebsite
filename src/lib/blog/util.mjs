/**
 * @file Small pure helpers for blog posts, shared by the pages and the tests.
 * @module lib/blog/util
 */

export const WORDS_PER_MINUTE = 220;

// Words a reader actually reads: code blocks, HTML, link URLs, image syntax
// and Markdown punctuation are left out.
export function countWords(markdown = '') {
  const prose = markdown
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, ' ') // fenced code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')                 // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')                // links → their text
    .replace(/<[^>]+>/g, ' ')                               // HTML tags
    .replace(/^\s*>\s*\[![a-z]+\]/gim, ' ');                // callout markers

  return (prose.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) ?? []).length;
}

// Whole minutes, at least 1.
export function readingMinutes(words, wpm = WORDS_PER_MINUTE) {
  return Math.max(1, Math.round(words / wpm));
}

// Date → "2026-11-09" (UTC, so a build in any timezone prints the same day).
export function isoDay(date) {
  return date.toISOString().slice(0, 10);
}

// Sections (##) and subsections (###) as `tree` output rows:
// [{ prefix: '├── ' | '│   └── ' | …, slug, text, depth }].
export function tocTree(headings) {
  const rows = headings.filter((h) => h.depth === 2 || h.depth === 3);
  // A subsection before the first section is shown as a section.
  const items = rows.map((h, i) => ({ ...h, depth: h.depth === 3 && !rows.slice(0, i).some((r) => r.depth === 2) ? 2 : h.depth }));

  return items.map((h, i) => {
    const later = items.slice(i + 1);
    const nextSection = later.findIndex((r) => r.depth === 2);
    if (h.depth === 2) {
      const last = nextSection === -1;
      return { ...h, prefix: last ? '└── ' : '├── ' };
    }
    // Is there another section after this subsection's section?
    const sectionIndex = items.slice(0, i).findLastIndex((r) => r.depth === 2);
    const sectionIsLast = !items.slice(sectionIndex + 1).some((r) => r.depth === 2);
    const lastInSection = later.length === 0 || later[0].depth === 2;
    return { ...h, prefix: `${sectionIsLast ? '    ' : '│   '}${lastInSection ? '└── ' : '├── '}` };
  });
}

// Newest first; posts on the same day keep a stable order by slug.
export function sortPosts(posts) {
  return [...posts].sort((a, b) => b.date - a.date || a.slug.localeCompare(b.slug));
}

// Every tag with how many posts use it: most used first, then A–Z.
export function tagCounts(posts) {
  const counts = new Map();
  for (const post of posts) for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
export const escXml = (text) => String(text).replace(/[&<>"']/g, (c) => XML_ESCAPES[c]);

// RSS 2.0 feed for `posts` (newest first). `site` is the site's root URL.
export function buildRss({ site, title, description, posts }) {
  const root = new URL('/', site);
  const items = posts.map((post) => {
    const link = new URL(`/blog/${post.slug}/`, root).href;
    return [
      '    <item>',
      `      <title>${escXml(post.title)}</title>`,
      `      <link>${escXml(link)}</link>`,
      `      <guid isPermaLink="true">${escXml(link)}</guid>`,
      `      <pubDate>${post.date.toUTCString()}</pubDate>`,
      `      <description>${escXml(post.description)}</description>`,
      ...post.tags.map((tag) => `      <category>${escXml(tag)}</category>`),
      '    </item>',
    ].join('\n');
  });
  const feed = new URL('/rss.xml', root).href;
  const updated = posts
    .map((p) => p.updated ?? p.date)
    .reduce((latest, d) => (!latest || d > latest ? d : latest), null);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escXml(title)}</title>`,
    `    <link>${escXml(new URL('/blog/', root).href)}</link>`,
    `    <description>${escXml(description)}</description>`,
    '    <language>en</language>',
    `    <atom:link href="${escXml(feed)}" rel="self" type="application/rss+xml" />`,
    ...(updated ? [`    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>`] : []),
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
