import { defaultRulesContent } from '$lib/data/site-defaults';
import { getPageContent } from '$lib/server/content-store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const content = await getPageContent('/rules', defaultRulesContent);
  return { content };
};
