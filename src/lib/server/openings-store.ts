import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { defaultOpenings } from '$lib/data/default-openings';
import type { Opening } from '$lib/types';

const dataDir = path.resolve(process.cwd(), 'data');
const filePath = path.join(dataDir, 'openings.json');

async function ensureStore(): Promise<void> {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(filePath, 'utf8');
  } catch {
    await writeFile(filePath, JSON.stringify(defaultOpenings, null, 2), 'utf8');
  }
}

export async function getOpenings(): Promise<Opening[]> {
  await ensureStore();
  const raw = await readFile(filePath, 'utf8');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item): item is Opening => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Opening).id === 'string' &&
        typeof (item as Opening).title === 'string' &&
        typeof (item as Opening).description === 'string' &&
        typeof (item as Opening).category === 'string' &&
        Array.isArray((item as Opening).tags) &&
        typeof (item as Opening).contact === 'string' &&
        typeof (item as Opening).authorId === 'string' &&
        typeof (item as Opening).authorName === 'string' &&
        typeof (item as Opening).createdAt === 'string'
      );
    })
    .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
}

export async function addOpening(opening: Opening): Promise<void> {
  const current = await getOpenings();
  const updated = [opening, ...current];
  await writeFile(filePath, JSON.stringify(updated, null, 2), 'utf8');
}
