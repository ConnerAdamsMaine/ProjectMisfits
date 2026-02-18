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

function mapAdminRowToOpening(row: {
  id: string;
  title: string;
  description: string;
  category: Opening['category'];
  tags: string[];
  contact: string;
  author_id: string;
  author_name: string;
  created_at: Date;
  closed_at: Date | null;
  updated_at: Date;
}): Opening & { closedAt: string | null; updatedAt: string } {
  return {
    ...mapRowToOpening(row),
    closedAt: row.closed_at ? row.closed_at.toISOString() : null,
    updatedAt: row.updated_at.toISOString()
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
    WHERE closed_at IS NULL
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
          created_at,
          updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
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

export async function closeOpeningById(
  openingId: string,
  requesterId: string
): Promise<'closed' | 'not_found' | 'forbidden' | 'already_closed'> {
  await ensureDbSchema();

  const existing = await query<{ author_id: string; closed_at: Date | null }>(
    `
      SELECT author_id, closed_at
      FROM openings
      WHERE id = $1
      LIMIT 1
    `,
    [openingId]
  );

  const row = existing.rows[0];
  if (!row) return 'not_found';
  if (row.author_id !== requesterId) return 'forbidden';
  if (row.closed_at) return 'already_closed';

  await query(
    `
      UPDATE openings
      SET closed_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `,
    [openingId]
  );

  return 'closed';
}

export async function listAllOpenings(): Promise<(Opening & { closedAt: string | null; updatedAt: string })[]> {
  await ensureDbSchema();

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
    closed_at: Date | null;
    updated_at: Date;
  }>(`
    SELECT
      id,
      title,
      description,
      category,
      tags,
      contact,
      author_id,
      author_name,
      created_at,
      closed_at,
      updated_at
    FROM openings
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapAdminRowToOpening);
}

export async function updateOpeningById(
  openingId: string,
  patch: Partial<Pick<Opening, 'title' | 'description' | 'category' | 'tags' | 'contact'>>
): Promise<'updated' | 'not_found'> {
  await ensureDbSchema();

  const existing = await query<{ id: string }>(
    `
      SELECT id
      FROM openings
      WHERE id = $1
      LIMIT 1
    `,
    [openingId]
  );

  if (!existing.rows[0]) return 'not_found';

  await query(
    `
      UPDATE openings
      SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        category = COALESCE($4, category),
        tags = COALESCE($5, tags),
        contact = COALESCE($6, contact),
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      openingId,
      patch.title ?? null,
      patch.description ?? null,
      patch.category ?? null,
      patch.tags ?? null,
      patch.contact ?? null
    ]
  );

  return 'updated';
}

export async function deleteOpeningById(openingId: string): Promise<'deleted' | 'not_found'> {
  await ensureDbSchema();

  const result = await query<{ id: string }>(
    `
      DELETE FROM openings
      WHERE id = $1
      RETURNING id
    `,
    [openingId]
  );

  return result.rows[0] ? 'deleted' : 'not_found';
}

export async function transferOpeningOwnership(
  openingId: string,
  newOwnerId: string,
  newOwnerName: string
): Promise<'transferred' | 'not_found'> {
  await ensureDbSchema();

  await query(
    `
      INSERT INTO discord_users (id, username, avatar_url)
      VALUES ($1, $2, NULL)
      ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, updated_at = NOW()
    `,
    [newOwnerId, newOwnerName]
  );

  const result = await query<{ id: string }>(
    `
      UPDATE openings
      SET author_id = $2, author_name = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `,
    [openingId, newOwnerId, newOwnerName]
  );

  return result.rows[0] ? 'transferred' : 'not_found';
}
