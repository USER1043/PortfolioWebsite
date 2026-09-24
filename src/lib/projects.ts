/**
 * @file Project data access — reads the `projects` content collection.
 * @module lib/projects
 */
import { getCollection, type CollectionEntry } from 'astro:content';

// Returns published projects sorted by `order`, then name.
export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const entries = await getCollection('projects', ({ data }) => !data.draft);
  return entries.sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
}
