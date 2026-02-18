import { pageContentDefaults, type PageContentPath } from '$lib/data/site-defaults';
import { ensureDbSchema, query } from '$lib/server/db';

interface PageContentRow {
  page_path: string;
  content: unknown;
  updated_at: Date;
  updated_by: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeWithDefault<T extends Record<string, unknown>>(fallback: T, candidate: unknown): T {
  if (!isRecord(candidate)) return { ...fallback };
  return { ...fallback, ...candidate } as T;
}

export async function getPageContent<T extends Record<string, unknown>>(
  pagePath: PageContentPath,
  fallback: T
): Promise<T> {
  await ensureDbSchema();

  const result = await query<PageContentRow>(
    `
      SELECT page_path, content, updated_at, updated_by
      FROM page_content
      WHERE page_path = $1
      LIMIT 1
    `,
    [pagePath]
  );

  const row = result.rows[0];
  return mergeWithDefault(fallback, row?.content);
}

export async function listPageContent(): Promise<{ pagePath: string; content: unknown; updatedAt: string }[]> {
  await ensureDbSchema();

  const result = await query<PageContentRow>(
    `
      SELECT page_path, content, updated_at, updated_by
      FROM page_content
      ORDER BY page_path ASC
    `
  );

  return result.rows.map((row) => ({
    pagePath: row.page_path,
    content: row.content,
    updatedAt: row.updated_at.toISOString()
  }));
}

export async function upsertPageContent(
  pagePath: PageContentPath,
  content: unknown,
  updatedBy: string
): Promise<void> {
  await ensureDbSchema();

  await query(
    `
      INSERT INTO page_content (page_path, content, updated_by)
      VALUES ($1, $2::jsonb, $3)
      ON CONFLICT (page_path)
      DO UPDATE SET content = EXCLUDED.content, updated_by = EXCLUDED.updated_by, updated_at = NOW()
    `,
    [pagePath, JSON.stringify(content), updatedBy]
  );
}

export function getPageContentFallback(pagePath: PageContentPath): Record<string, unknown> {
  return { ...pageContentDefaults[pagePath] };
}
