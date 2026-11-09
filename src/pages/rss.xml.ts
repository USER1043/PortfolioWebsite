/**
 * @file /rss.xml — the blog's RSS feed, generated at build time.
 * @module pages/rss.xml
 */
import type { APIRoute } from 'astro';
import { getPosts } from '../lib/blog';
import { buildRss } from '../lib/blog/util.mjs';

export const GET: APIRoute = async ({ site }) => {
  const xml = buildRss({
    site: site ?? new URL('https://prajan-karthik.vercel.app'),
    title: 'Prajan Karthik — Writing',
    description: 'Posts about the projects I build: the problems, the decisions and the trade-offs.',
    posts: await getPosts(),
  });
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
