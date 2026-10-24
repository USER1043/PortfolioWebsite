/**
 * @file sitemap.xml for search engines, generated at build time.
 * @module pages/sitemap.xml
 */
import type { APIRoute } from 'astro';

// Public pages, written the way Astro serves them (directory URLs).
const PAGES = ['/', '/projects/', '/contact/'];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://prajan-karthik.vercel.app');
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map(
    (path) => `  <url><loc>${new URL(path, base).href}</loc><lastmod>${lastmod}</lastmod></url>`,
  ).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
