import crypto from 'node:crypto';
import { ensureDbSchema, query } from '$lib/server/db';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionUser {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export async function createSessionForUser(user: SessionUser): Promise<string> {
  await ensureDbSchema();

  await query(
    `
      INSERT INTO discord_users (id, username, avatar_url, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (id)
      DO UPDATE SET username = EXCLUDED.username, avatar_url = EXCLUDED.avatar_url, updated_at = NOW()
    `,
    [user.id, user.username, user.avatarUrl]
  );

  const sessionId = crypto.randomUUID();

  await query(
    `
      INSERT INTO auth_sessions (id, user_id, expires_at)
      VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 second'))
    `,
    [sessionId, user.id, SESSION_MAX_AGE_SECONDS]
  );

  return sessionId;
}

export async function getUserBySessionId(sessionId: string): Promise<SessionUser | null> {
  await ensureDbSchema();

  await query(`DELETE FROM auth_sessions WHERE expires_at <= NOW()`);

  const result = await query<{
    id: string;
    username: string;
    avatar_url: string | null;
  }>(
    `
      SELECT u.id, u.username, u.avatar_url
      FROM auth_sessions s
      INNER JOIN discord_users u ON u.id = s.user_id
      WHERE s.id = $1
      LIMIT 1
    `,
    [sessionId]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    avatarUrl: row.avatar_url
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await ensureDbSchema();
  await query(`DELETE FROM auth_sessions WHERE id = $1`, [sessionId]);
}

export function getSessionMaxAgeSeconds(): number {
  return SESSION_MAX_AGE_SECONDS;
}
