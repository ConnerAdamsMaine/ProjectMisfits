import { env } from '$env/dynamic/private';
import { Pool } from 'pg';
import type { QueryResult, QueryResultRow } from 'pg';

const useSsl = env.DATABASE_SSL === 'true';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('Missing DATABASE_URL environment variable.');
    }

    pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      max: 10
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  if (params) {
    return getPool().query<T>(text, params);
  }

  return getPool().query<T>(text);
}

let schemaInitPromise: Promise<void> | null = null;

export async function ensureDbSchema(): Promise<void> {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS discord_users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          avatar_url TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS auth_sessions (
          id UUID PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES discord_users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL
        );
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions(user_id);
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON auth_sessions(expires_at);
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS openings (
          id UUID PRIMARY KEY,
          title VARCHAR(80) NOT NULL,
          description VARCHAR(360) NOT NULL,
          category TEXT NOT NULL CHECK (category IN ('Business', 'Gang', 'Department')),
          tags TEXT[] NOT NULL DEFAULT '{}',
          contact VARCHAR(120) NOT NULL,
          author_id TEXT NOT NULL REFERENCES discord_users(id) ON DELETE RESTRICT,
          author_name TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS openings_created_at_idx ON openings(created_at DESC);
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS openings_category_idx ON openings(category);
      `);
    })();
  }

  await schemaInitPromise;
}
