/**
 * @file Content collections — the single source of truth for site content.
 * @module content.config
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project in src/content/projects/.
// Frontmatter holds the card data; the Markdown body is optional long-form detail.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    tech: z.array(z.string()).min(1),
    status: z.string(),
    summary: z.string(),
    whyItMatters: z.string().optional(),
    demo: z.url().optional(),
    github: z.url().optional(),
    // GitHub repo name, used to match against repos tagged `portfolio`.
    repo: z.string().optional(),
    // Lower numbers appear first.
    order: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
