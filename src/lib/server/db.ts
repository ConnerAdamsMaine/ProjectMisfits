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
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          closed_at TIMESTAMPTZ
        );
      `);

      await query(`
        ALTER TABLE openings
        ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS openings_created_at_idx ON openings(created_at DESC);
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS openings_category_idx ON openings(category);
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS openings_closed_at_idx ON openings(closed_at);
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS user_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL REFERENCES discord_users(id) ON DELETE CASCADE,
          resource TEXT NOT NULL,
          action TEXT NOT NULL,
          granted_by TEXT REFERENCES discord_users(id),
          granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ,
          UNIQUE(user_id, resource, action)
        );
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS user_permissions_user_id_idx ON user_permissions(user_id);
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS user_permissions_resource_idx ON user_permissions(resource, action);
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS api_keys (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key_hash TEXT NOT NULL UNIQUE,
          key_type TEXT NOT NULL CHECK (key_type IN ('super', 'admin')),
          user_id TEXT REFERENCES discord_users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ,
          last_used_at TIMESTAMPTZ,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_by TEXT REFERENCES discord_users(id)
        );
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS api_keys_active_idx ON api_keys(is_active) WHERE is_active = TRUE;
      `);

      await query(`
        CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id) WHERE user_id IS NOT NULL;
      `);
    })();
  }

  await schemaInitPromise;
}
