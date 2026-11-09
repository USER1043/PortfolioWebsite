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

// Newest first; posts on the same day keep a stable order by slug.
export function sortPosts(posts) {
  return [...posts].sort((a, b) => b.date - a.date || a.slug.localeCompare(b.slug));
}
