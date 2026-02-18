import crypto from 'node:crypto';
import { ensureDbSchema, query } from '$lib/server/db';

export interface UserPermissionRecord {
  userId: string;
  resource: string;
  action: string;
  grantedAt: string;
  expiresAt: string | null;
  grantedBy: string | null;
}

export interface AdminUserSummary {
  id: string;
  username: string;
  avatarUrl: string | null;
  updatedAt: string;
}

export interface AdminApiKey {
  id: string;
  keyType: 'super' | 'admin';
  userId: string | null;
  name: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
}

export interface AdminStats {
  period: '24h' | '7d' | '30d';
  totalRequests: number;
  requestsByEndpoint: Record<string, number>;
  requestsByUser: Record<string, number>;
  errorRate: number;
  avgResponseTimeMs: number;
}

function mapPermissionRow(row: {
  user_id: string;
  resource: string;
  action: string;
  granted_at: Date;
  expires_at: Date | null;
  granted_by: string | null;
}): UserPermissionRecord {
  return {
    userId: row.user_id,
    resource: row.resource,
    action: row.action,
    grantedAt: row.granted_at.toISOString(),
    expiresAt: row.expires_at ? row.expires_at.toISOString() : null,
    grantedBy: row.granted_by
  };
}

export async function userHasAdminAccess(userId: string): Promise<boolean> {
  await ensureDbSchema();

  const result = await query<{ allowed: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM user_permissions
        WHERE user_id = $1
          AND (
            (resource = 'admin_dashboard' AND action IN ('read', 'admin')) OR
            (resource = 'api_keys' AND action IN ('admin', 'read')) OR
            (resource = 'users' AND action IN ('read', 'admin'))
          )
          AND (expires_at IS NULL OR expires_at > NOW())
      ) AS allowed
    `,
    [userId]
  );

  return Boolean(result.rows[0]?.allowed);
}

export async function userHasPermission(
  userId: string | null,
  resource: string,
  action: string
): Promise<boolean> {
  if (!userId) return false;

  await ensureDbSchema();

  const result = await query<{ allowed: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM user_permissions
        WHERE user_id = $1
          AND resource = $2
          AND action IN ($3, 'admin')
          AND (expires_at IS NULL OR expires_at > NOW())
      ) AS allowed
    `,
    [userId, resource, action]
  );

  return Boolean(result.rows[0]?.allowed);
}

export async function userCanViewPage(userId: string | null, path: string): Promise<boolean> {
  await ensureDbSchema();

  const normalizedPath = path.trim() || '/';
  const resource = `page:${normalizedPath}`;

  const gatedResult = await query<{ requires_permission: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM user_permissions
        WHERE resource = $1
          AND action IN ('view', 'read')
          AND (expires_at IS NULL OR expires_at > NOW())
      ) AS requires_permission
    `,
    [resource]
  );

  const requiresPermission = Boolean(gatedResult.rows[0]?.requires_permission);
  if (!requiresPermission) return true;
  if (!userId) return false;

  const allowResult = await query<{ allowed: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM user_permissions
        WHERE user_id = $1
          AND resource = $2
          AND action IN ('view', 'read')
          AND (expires_at IS NULL OR expires_at > NOW())
      ) AS allowed
    `,
    [userId, resource]
  );

  return Boolean(allowResult.rows[0]?.allowed);
}

export async function listAdminUsers(search: string): Promise<AdminUserSummary[]> {
  await ensureDbSchema();

  const normalized = `%${search.trim()}%`;
  const useFilter = search.trim().length > 0;

  const result = await query<{
    id: string;
    username: string;
    avatar_url: string | null;
    updated_at: Date;
  }>(
    `
      SELECT id, username, avatar_url, updated_at
      FROM discord_users
      WHERE ($1::boolean = false OR id ILIKE $2 OR username ILIKE $2)
      ORDER BY updated_at DESC
      LIMIT 40
    `,
    [useFilter, normalized]
  );

  return result.rows.map((row) => ({
    id: row.id,
    username: row.username,
    avatarUrl: row.avatar_url,
    updatedAt: row.updated_at.toISOString()
  }));
}

export async function listPermissionsForUser(userId: string): Promise<UserPermissionRecord[]> {
  await ensureDbSchema();

  const result = await query<{
    user_id: string;
    resource: string;
    action: string;
    granted_at: Date;
    expires_at: Date | null;
    granted_by: string | null;
  }>(
    `
      SELECT user_id, resource, action, granted_at, expires_at, granted_by
      FROM user_permissions
      WHERE user_id = $1
      ORDER BY resource ASC, action ASC
    `,
    [userId]
  );

  return result.rows.map(mapPermissionRow);
}

export async function grantPermission(
  userId: string,
  resource: string,
  action: string,
  grantedBy: string,
  expiresInDays: number | null
): Promise<void> {
  await ensureDbSchema();

  await query(
    `
      INSERT INTO discord_users (id, username, avatar_url)
      VALUES ($1, $2, NULL)
      ON CONFLICT (id) DO NOTHING
    `,
    [userId, `Unregistered-${userId.slice(-6)}`]
  );

  if (!expiresInDays || Number.isNaN(expiresInDays) || expiresInDays <= 0) {
    await query(
      `
        INSERT INTO user_permissions (user_id, resource, action, granted_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, resource, action)
        DO UPDATE SET granted_by = EXCLUDED.granted_by, expires_at = NULL, granted_at = NOW()
      `,
      [userId, resource, action, grantedBy]
    );

    return;
  }

  await query(
    `
      INSERT INTO user_permissions (user_id, resource, action, granted_by, expires_at)
      VALUES ($1, $2, $3, $4, NOW() + ($5 * INTERVAL '1 day'))
      ON CONFLICT (user_id, resource, action)
      DO UPDATE SET granted_by = EXCLUDED.granted_by, expires_at = EXCLUDED.expires_at, granted_at = NOW()
    `,
    [userId, resource, action, grantedBy, expiresInDays]
  );
}

export async function revokePermission(userId: string, resource: string, action: string): Promise<void> {
  await ensureDbSchema();
  await query(`DELETE FROM user_permissions WHERE user_id = $1 AND resource = $2 AND action = $3`, [
    userId,
    resource,
    action
  ]);
}

function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

export async function createAdminApiKey(
  userId: string,
  name: string,
  createdBy: string,
  expiresInDays: number | null
): Promise<{ rawKey: string; keyId: string; expiresAt: string | null }> {
  await ensureDbSchema();

  const rawKey = `PMA_Admin.${userId}.${crypto.randomBytes(24).toString('base64url')}`;
  const keyHash = hashApiKey(rawKey);

  const result = await query<{ id: string; expires_at: Date | null }>(
    `
      INSERT INTO api_keys (
        key_hash,
        key_type,
        user_id,
        name,
        permissions,
        expires_at,
        is_active,
        created_by
      ) VALUES (
        $1,
        'admin',
        $2,
        $3,
        '[]'::jsonb,
        CASE WHEN $4::int IS NULL OR $4::int <= 0 THEN NULL ELSE NOW() + ($4 * INTERVAL '1 day') END,
        TRUE,
        $5
      )
      RETURNING id, expires_at
    `,
    [keyHash, userId, name, expiresInDays, createdBy]
  );

  const row = result.rows[0];
  return {
    rawKey,
    keyId: row.id,
    expiresAt: row.expires_at ? row.expires_at.toISOString() : null
  };
}

export async function listAdminApiKeys(userId: string): Promise<AdminApiKey[]> {
  await ensureDbSchema();

  const result = await query<{
    id: string;
    key_type: 'super' | 'admin';
    user_id: string | null;
    name: string;
    created_at: Date;
    expires_at: Date | null;
    last_used_at: Date | null;
    is_active: boolean;
  }>(
    `
      SELECT id, key_type, user_id, name, created_at, expires_at, last_used_at, is_active
      FROM api_keys
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    keyType: row.key_type,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at.toISOString(),
    expiresAt: row.expires_at ? row.expires_at.toISOString() : null,
    lastUsedAt: row.last_used_at ? row.last_used_at.toISOString() : null,
    isActive: row.is_active
  }));
}

export async function revokeApiKey(keyId: string, requesterId: string): Promise<void> {
  await ensureDbSchema();

  await query(
    `
      UPDATE api_keys
      SET is_active = FALSE
      WHERE id = $1 AND (created_by = $2 OR user_id = $2)
    `,
    [keyId, requesterId]
  );
}

export async function getAdminStats(period: '24h' | '7d' | '30d'): Promise<AdminStats> {
  await ensureDbSchema();

  const intervalMap: Record<'24h' | '7d' | '30d', string> = {
    '24h': "INTERVAL '24 hours'",
    '7d': "INTERVAL '7 days'",
    '30d': "INTERVAL '30 days'"
  };

  const intervalSql = intervalMap[period];

  const totals = await query<{ total_requests: number; error_requests: number; avg_response_time_ms: number }>(
    `
      SELECT
        COUNT(*)::int AS total_requests,
        COUNT(*) FILTER (WHERE response_code >= 400)::int AS error_requests,
        COALESCE(AVG(processing_time_ms), 0)::float AS avg_response_time_ms
      FROM api_audit_log
      WHERE created_at >= NOW() - ${intervalSql}
    `
  );

  const byEndpoint = await query<{ endpoint: string; request_count: number }>(
    `
      SELECT endpoint, COUNT(*)::int AS request_count
      FROM api_audit_log
      WHERE created_at >= NOW() - ${intervalSql}
      GROUP BY endpoint
      ORDER BY request_count DESC
      LIMIT 20
    `
  );

  const byUser = await query<{ discord_user_id: string; request_count: number }>(
    `
      SELECT discord_user_id, COUNT(*)::int AS request_count
      FROM api_audit_log
      WHERE created_at >= NOW() - ${intervalSql}
        AND discord_user_id IS NOT NULL
      GROUP BY discord_user_id
      ORDER BY request_count DESC
      LIMIT 20
    `
  );

  const totalRequests = Number(totals.rows[0]?.total_requests ?? 0);
  const errorRequests = Number(totals.rows[0]?.error_requests ?? 0);
  const avgResponseTimeMs = Number(totals.rows[0]?.avg_response_time_ms ?? 0);

  return {
    period,
    totalRequests,
    requestsByEndpoint: Object.fromEntries(byEndpoint.rows.map((row) => [row.endpoint, row.request_count])),
    requestsByUser: Object.fromEntries(byUser.rows.map((row) => [row.discord_user_id, row.request_count])),
    errorRate: totalRequests > 0 ? errorRequests / totalRequests : 0,
    avgResponseTimeMs: Number(avgResponseTimeMs.toFixed(2))
  };
}
