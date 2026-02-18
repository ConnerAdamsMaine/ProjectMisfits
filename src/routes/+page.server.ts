import { defaultHomeContent } from '$lib/data/site-defaults';
import { getPageContent } from '$lib/server/content-store';
import { listLocalShowcaseImageUrls } from '$lib/server/showcase-files';
import { buildShowcaseDisplayItems, listShowcaseItems } from '$lib/server/showcase-store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [content, localImages, dbItems] = await Promise.all([
    getPageContent('/', defaultHomeContent),
    listLocalShowcaseImageUrls(),
    listShowcaseItems(false)
  ]);

  const displayItems = buildShowcaseDisplayItems(localImages, dbItems);

  return {
    content,
    gallery: displayItems.slice(0, 12).map((item) => item.imageUrl)
  };
};
