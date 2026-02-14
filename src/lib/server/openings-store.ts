import { defaultOpenings } from '$lib/data/default-openings';
import { ensureDbSchema, query } from '$lib/server/db';
import type { Opening } from '$lib/types';

let defaultSeedPromise: Promise<void> | null = null;

async function seedDefaultsIfNeeded(): Promise<void> {
  if (!defaultSeedPromise) {
    defaultSeedPromise = (async () => {
      await ensureDbSchema();

      const countResult = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM openings`);
      const hasRows = Number(countResult.rows[0]?.count ?? '0') > 0;

      if (hasRows || defaultOpenings.length === 0) return;

      for (const opening of defaultOpenings) {
        await query(
          `
            INSERT INTO openings (
              id,
              title,
              description,
              category,
              tags,
              contact,
              author_id,
              author_name,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            opening.id,
            opening.title,
            opening.description,
            opening.category,
            opening.tags,
            opening.contact,
            opening.authorId,
            opening.authorName,
            opening.createdAt
          ]
        );
      }
    })();
  }

  await defaultSeedPromise;
}

function mapRowToOpening(row: {
  id: string;
  title: string;
  description: string;
  category: Opening['category'];
  tags: string[];
  contact: string;
  author_id: string;
  author_name: string;
  created_at: Date;
}): Opening {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    tags: row.tags,
    contact: row.contact,
    authorId: row.author_id,
    authorName: row.author_name,
    createdAt: row.created_at.toISOString()
  };
}

export async function getOpenings(): Promise<Opening[]> {
  await seedDefaultsIfNeeded();

  const result = await query<{
    id: string;
    title: string;
    description: string;
    category: Opening['category'];
    tags: string[];
    contact: string;
    author_id: string;
    author_name: string;
    created_at: Date;
  }>(`
    SELECT id, title, description, category, tags, contact, author_id, author_name, created_at
    FROM openings
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapRowToOpening);
}

export async function addOpening(opening: Opening): Promise<void> {
  await ensureDbSchema();

  await query(
    `
      INSERT INTO openings (
        id,
        title,
        description,
        category,
        tags,
        contact,
        author_id,
        author_name,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      opening.id,
      opening.title,
      opening.description,
      opening.category,
      opening.tags,
      opening.contact,
      opening.authorId,
      opening.authorName,
      opening.createdAt
    ]
  );
}
