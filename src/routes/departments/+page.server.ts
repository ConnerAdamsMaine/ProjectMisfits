import { defaultDepartmentsContent } from '$lib/data/site-defaults';
import { getPageContent } from '$lib/server/content-store';
import { getOpenings } from '$lib/server/openings-store';
import { categories } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const [openings, content] = await Promise.all([
    getOpenings(),
    getPageContent('/departments', defaultDepartmentsContent)
  ]);
  const tagSet = new Set<string>();

  for (const opening of openings) {
    for (const tag of opening.tags) {
      tagSet.add(tag);
    }
  }

  return {
    openings,
    categories,
    availableTags: [...tagSet].sort((a, b) => a.localeCompare(b)),
    user: locals.user,
    content
  };
};
