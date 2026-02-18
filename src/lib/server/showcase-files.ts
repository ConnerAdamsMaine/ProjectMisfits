import { readdir } from 'node:fs/promises';
import path from 'node:path';

const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export async function listLocalShowcaseImageUrls(): Promise<string[]> {
  const showcaseDir = path.resolve(process.cwd(), 'assets/showcase');

  try {
    const entries = await readdir(showcaseDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => allowedExt.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => `/api/showcase/${encodeURIComponent(name)}`);
  } catch {
    return [];
  }
}
