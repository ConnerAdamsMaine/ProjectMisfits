import { getOpenings } from '$lib/server/openings-store';
import { categories } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const openings = await getOpenings();
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
    user: locals.user
  };
};
