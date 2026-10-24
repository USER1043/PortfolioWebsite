/**
 * @file Project data access — generated projects merged with manual overrides.
 * @module lib/projects
 */
import { getCollection } from 'astro:content';

export interface Project {
  id: string;
  name: string;
  github?: string;
  demo?: string;
  tech: string[];
  status: string;
  summary: string;
  whyItMatters?: string;
}

// Returns visible projects with overrides applied, in display order.
export async function getProjects(): Promise<Project[]> {
  const [generated, overrides] = await Promise.all([
    getCollection('projects'),
    getCollection('projectOverrides'),
  ]);
  const overrideById = new Map(overrides.map((o) => [o.id, o.data]));

  return generated
    .map(({ id, data }) => {
      const { hidden = false, order, ...fields } = overrideById.get(id) ?? {};
      return {
        hidden,
        order: order ?? data.order,
        project: {
          id,
          name: fields.name ?? data.name,
          github: data.github,
          demo: fields.demo ?? data.demo,
          tech: fields.tech ?? data.tech,
          status: fields.status ?? data.status,
          summary: fields.summary ?? data.summary,
          whyItMatters: fields.whyItMatters ?? data.whyItMatters,
        },
      };
    })
    .filter((p) => !p.hidden)
    .sort((a, b) => a.order - b.order)
    .map((p) => p.project);
}
