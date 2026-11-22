/**
 * @file sitemap.xml for search engines, generated at build time.
 * @module pages/sitemap.xml
 */
import type { APIRoute } from 'astro';
import { getPosts } from '../lib/blog';
import { isoDay, tagCounts } from '../lib/blog/util.mjs';

// Public pages, written the way Astro serves them (directory URLs).
const PAGES = ['/', '/projects/', '/contact/', '/blog/'];

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://prajan-karthik.vercel.app');
  const today = new Date().toISOString().slice(0, 10);
  const posts = await getPosts();

  const entries: [string, string][] = [
    ...PAGES.map((path): [string, string] => [path, today]),
    ...posts.map((p): [string, string] => [`/blog/${p.slug}/`, isoDay(p.updated ?? p.date)]),
    ...tagCounts(posts).map(({ tag }): [string, string] => [`/blog/tag/${tag}/`, today]),
  ];
  const urls = entries
    .map(([path, lastmod]) => `  <url><loc>${new URL(path, base).href}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
