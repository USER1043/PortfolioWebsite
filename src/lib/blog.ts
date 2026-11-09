/**
 * @file Blog post data access: published posts, newest first, with word counts.
 * Drafts are included in `npm run dev` and left out of the built site.
 * @module lib/blog
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { countWords, readingMinutes, sortPosts } from './blog/util.mjs';

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
  return sortPosts(posts);
}
