import { defaultShowcasesContent } from '$lib/data/site-defaults';
import { getPageContent } from '$lib/server/content-store';
import { listLocalShowcaseImageUrls } from '$lib/server/showcase-files';
import { buildShowcaseDisplayItems, listShowcaseItems } from '$lib/server/showcase-store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [localImages, dbItems, content] = await Promise.all([
    listLocalShowcaseImageUrls(),
    listShowcaseItems(false),
    getPageContent('/showcases', defaultShowcasesContent)
  ]);

  const items = buildShowcaseDisplayItems(localImages, dbItems);
  const grouped = new Map<string, typeof items>();

  for (const item of items) {
    const category = item.category.trim() || 'Uncategorized';
    const group = grouped.get(category) ?? [];
    group.push(item);
    grouped.set(category, group);
  }

  return {
    content,
    categories: [...grouped.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, entries]) => ({
        name,
        items: entries.sort((a, b) => a.imageUrl.localeCompare(b.imageUrl))
      }))
  };
};
