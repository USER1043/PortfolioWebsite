/**
 * @file robots.txt: allow everything and point crawlers at the sitemap.
 * @module pages/robots.txt
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://prajan-karthik.vercel.app');
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', base).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
