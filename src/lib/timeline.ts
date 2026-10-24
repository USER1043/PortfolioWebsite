/**
 * @file Career milestones for the terminal's `git log`.
 * @module lib/timeline
 */
import { getCollection } from 'astro:content';

export interface Milestone {
  date?: string;
  message: string;
}

export async function getTimeline(): Promise<Milestone[]> {
  const entries = await getCollection('timeline');
  return entries.map((entry) => entry.data);
}
