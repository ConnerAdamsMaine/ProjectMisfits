import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { PageServerLoad } from './$types';

const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export const load: PageServerLoad = async () => {
  const showcaseDir = path.resolve(process.cwd(), 'assets/showcase');

  let localImages: string[] = [];

  try {
    const entries = await readdir(showcaseDir, { withFileTypes: true });
    localImages = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => allowedExt.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => `/api/showcase/${encodeURIComponent(name)}`);
  } catch {
    localImages = [];
  }

  return { localImages };
};
