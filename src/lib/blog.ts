/**
 * @file Blog post data access: published posts, newest first, with word counts.
 * Drafts are included in `npm run dev` and left out of the built site.
 * @module lib/blog
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { countWords, readingMinutes, sortPosts } from './blog/util.mjs';
import { getProjects } from './projects';

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: Date;
  updated?: Date;
  tags: string[];
  /** GitHub repo name of the related project, as in src/data/projects.json. */
  project?: string;
  draft: boolean;
  words: number;
  minutes: number;
  entry: CollectionEntry<'blog'>;
}

export async function getPosts({ includeDrafts = import.meta.env.DEV } = {}): Promise<Post[]> {
  const entries = await getCollection('blog', ({ data }) => includeDrafts || !data.draft);
  const posts = entries.map((entry) => {
    const words = countWords(entry.body);
    return {
      slug: entry.id,
      ...entry.data,
      words,
      minutes: readingMinutes(words),
      entry,
    };
  });
  await warnAboutUnknownProjects(posts);
  return sortPosts(posts);
}

// A post can name a project that isn't on the site (unpinned, renamed, or
// hidden in overrides.yml). The post still builds, just without the link;
// this says why, once per post per build.
const warned = new Set<string>();
async function warnAboutUnknownProjects(posts: { slug: string; project?: string }[]) {
  const named = posts.filter((p) => p.project && !warned.has(p.slug));
  if (named.length === 0) return;
  const ids = new Set((await getProjects()).map((p) => p.id));
  for (const post of named) {
    warned.add(post.slug);
    if (!ids.has(post.project!)) {
      console.warn(
        `[blog] ${post.slug}.md: project "${post.project}" isn't on the site, so the post won't link to it. ` +
        `Use a repo name from src/data/projects.json (e.g. "${[...ids][0] ?? 'my-repo'}").`,
      );
    }
  }
}
