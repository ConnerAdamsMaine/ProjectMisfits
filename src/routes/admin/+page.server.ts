import {
  createAdminApiKey,
  getAdminStats,
  grantPermission,
  listAdminApiKeys,
  listAdminUsers,
  listPermissionsForUser,
  revokeApiKey,
  revokePermission
} from '$lib/server/admin-store';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const pagePaths = ['/', '/showcases', '/departments', '/rules', '/tos', '/admin'] as const;

function getRequiredAdminUser(locals: App.Locals): NonNullable<App.Locals['user']> {
  if (!locals.user || !locals.isAdmin) {
    throw redirect(303, '/departments');
  }

  return locals.user;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const actingUser = getRequiredAdminUser(locals);

  const search = (url.searchParams.get('q') ?? '').trim();
  const selectedUserId = (url.searchParams.get('user') ?? actingUser.id).trim();

  const period = (url.searchParams.get('period') ?? '24h').trim();
  const statsPeriod = period === '7d' || period === '30d' ? period : '24h';

  const users = await listAdminUsers(search);
  const effectiveUserId = selectedUserId || actingUser.id;
  const permissions = await listPermissionsForUser(effectiveUserId);
  const apiKeys = await listAdminApiKeys(effectiveUserId);
  const stats = await getAdminStats(statsPeriod);

  return {
    users,
    selectedUserId: effectiveUserId,
    permissions,
    apiKeys,
    pagePaths,
    stats
  };
};

export const actions: Actions = {
  grantPermission: async ({ locals, request }) => {
    const actingUser = getRequiredAdminUser(locals);

    const form = await request.formData();
    const userId = String(form.get('userId') ?? '').trim();
    const resource = String(form.get('resource') ?? '').trim();
    const action = String(form.get('action') ?? '').trim();
    const expiresRaw = String(form.get('expiresInDays') ?? '').trim();

    if (!userId || !resource || !action) {
      return fail(400, { error: 'Missing required fields for permission grant.' });
    }

    const parsedExpires = expiresRaw ? Number(expiresRaw) : null;
    if (
      expiresRaw &&
      (parsedExpires === null || !Number.isFinite(parsedExpires) || parsedExpires <= 0 || parsedExpires > 3650)
    ) {
      return fail(400, { error: 'Expiration days must be between 1 and 3650.' });
    }

    await grantPermission(userId, resource, action, actingUser.id, parsedExpires);
    return { success: `Granted ${resource}:${action} to ${userId}.` };
  },

  revokePermission: async ({ locals, request }) => {
    getRequiredAdminUser(locals);

    const form = await request.formData();
    const userId = String(form.get('userId') ?? '').trim();
    const resource = String(form.get('resource') ?? '').trim();
    const action = String(form.get('action') ?? '').trim();

    if (!userId || !resource || !action) {
      return fail(400, { error: 'Missing permission identifier.' });
    }

    await revokePermission(userId, resource, action);
    return { success: `Revoked ${resource}:${action} from ${userId}.` };
  },

  createApiKey: async ({ locals, request }) => {
    const actingUser = getRequiredAdminUser(locals);

    const form = await request.formData();
    const userId = String(form.get('userId') ?? '').trim();
    const name = String(form.get('name') ?? '').trim();
    const expiresRaw = String(form.get('expiresInDays') ?? '').trim();

    if (!userId || !name) {
      return fail(400, { error: 'User ID and key name are required.' });
    }

    const parsedExpires = expiresRaw ? Number(expiresRaw) : null;
    if (
      expiresRaw &&
      (parsedExpires === null || !Number.isFinite(parsedExpires) || parsedExpires <= 0 || parsedExpires > 3650)
    ) {
      return fail(400, { error: 'Expiration days must be between 1 and 3650.' });
    }

    const created = await createAdminApiKey(userId, name, actingUser.id, parsedExpires);

    return {
      success: `Created admin API key for ${userId}. Save it now.`,
      newApiKey: created.rawKey,
      newApiKeyId: created.keyId,
      newApiKeyExpiresAt: created.expiresAt
    };
  },

  revokeApiKey: async ({ locals, request }) => {
    const actingUser = getRequiredAdminUser(locals);

    const form = await request.formData();
    const keyId = String(form.get('keyId') ?? '').trim();

    if (!keyId) {
      return fail(400, { error: 'Missing API key id.' });
    }

    await revokeApiKey(keyId, actingUser.id);
    return { success: `Revoked key ${keyId}.` };
  }
};
