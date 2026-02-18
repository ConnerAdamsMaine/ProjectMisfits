import { defaultDiscordShowcaseImages } from '$lib/data/site-defaults';
import { ensureDbSchema, query } from '$lib/server/db';

export interface ShowcaseItem {
  id: string;
  imageUrl: string;
  category: string;
  title: string | null;
  description: string | null;
  ownerId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShowcaseRow {
  id: string;
  image_url: string;
  category: string;
  title: string | null;
  description: string | null;
  owner_id: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

let showcaseSeedPromise: Promise<void> | null = null;

function mapRow(row: ShowcaseRow): ShowcaseItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    category: row.category,
    title: row.title,
    description: row.description,
    ownerId: row.owner_id,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

async function seedShowcaseDefaultsIfNeeded(): Promise<void> {
  if (!showcaseSeedPromise) {
    showcaseSeedPromise = (async () => {
      await ensureDbSchema();

      const countResult = await query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM showcase_items`
      );
      const hasRows = Number(countResult.rows[0]?.count ?? '0') > 0;

      if (hasRows) return;

      for (const imageUrl of defaultDiscordShowcaseImages) {
        await query(
          `
            INSERT INTO showcase_items (image_url, category, title, description, owner_id, created_by, is_active)
            VALUES ($1, 'Discord', NULL, NULL, NULL, NULL, TRUE)
            ON CONFLICT (image_url) DO NOTHING
          `,
          [imageUrl]
        );
      }
    })();
  }

  await showcaseSeedPromise;
}

export async function listShowcaseItems(includeInactive = false): Promise<ShowcaseItem[]> {
  await seedShowcaseDefaultsIfNeeded();

  const result = await query<ShowcaseRow>(
    `
      SELECT id, image_url, category, title, description, owner_id, is_active, created_at, updated_at
      FROM showcase_items
      WHERE ($1::boolean = TRUE OR is_active = TRUE)
      ORDER BY category ASC, updated_at DESC
    `,
    [includeInactive]
  );

  return result.rows.map(mapRow);
}

export async function upsertShowcaseItem(input: {
  imageUrl: string;
  category: string;
  title?: string | null;
  description?: string | null;
  ownerId?: string | null;
  isActive?: boolean;
  actorId: string;
}): Promise<void> {
  await seedShowcaseDefaultsIfNeeded();

  await query(
    `
      INSERT INTO showcase_items (image_url, category, title, description, owner_id, is_active, created_by)
      VALUES ($1, $2, $3, $4, NULLIF($5, ''), COALESCE($6, TRUE), $7)
      ON CONFLICT (image_url)
      DO UPDATE SET
        category = EXCLUDED.category,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        owner_id = EXCLUDED.owner_id,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `,
    [
      input.imageUrl,
      input.category,
      input.title ?? null,
      input.description ?? null,
      input.ownerId ?? null,
      input.isActive ?? true,
      input.actorId
    ]
  );
}

export async function removeShowcaseItem(imageUrl: string): Promise<void> {
  await ensureDbSchema();
  await query(`DELETE FROM showcase_items WHERE image_url = $1`, [imageUrl]);
}

export function buildShowcaseDisplayItems(localImageUrls: string[], dbItems: ShowcaseItem[]): ShowcaseItem[] {
  const byUrl = new Map(dbItems.map((item) => [item.imageUrl, item]));
  const inferredLocalCategory = 'Local Uploads';

  for (const localUrl of localImageUrls) {
    if (byUrl.has(localUrl)) continue;

    byUrl.set(localUrl, {
      id: `local:${localUrl}`,
      imageUrl: localUrl,
      category: inferredLocalCategory,
      title: null,
      description: null,
      ownerId: null,
      isActive: true,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString()
    });
  }

  return [...byUrl.values()].filter((item) => item.isActive);
}
