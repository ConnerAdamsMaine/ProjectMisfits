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
import { pageContentDefaults, type PageContentPath } from '$lib/data/site-defaults';
import { listPageContent, upsertPageContent } from '$lib/server/content-store';
import { deleteOpeningById, listAllOpenings, transferOpeningOwnership, updateOpeningById } from '$lib/server/openings-store';
import { listShowcaseItems, removeShowcaseItem, upsertShowcaseItem } from '$lib/server/showcase-store';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const pagePaths = ['/', '/showcases', '/departments', '/rules', '/tos', '/admin'] as const;
const permissionActions = ['view', 'read', 'write', 'modify', 'delete'] as const;
const adminResources = ['showcase:images', 'departments:posts', 'rules:content', 'tos:content'] as const;

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

  const [users, pageContent, allOpenings, showcaseItems] = await Promise.all([
    listAdminUsers(search),
    listPageContent(),
    listAllOpenings(),
    listShowcaseItems(true)
  ]);
  const effectiveUserId = selectedUserId || actingUser.id;
  const [permissions, apiKeys, stats] = await Promise.all([
    listPermissionsForUser(effectiveUserId),
    listAdminApiKeys(effectiveUserId),
    getAdminStats(statsPeriod)
  ]);

  return {
    users,
    selectedUserId: effectiveUserId,
    permissions,
    apiKeys,
    pagePaths,
    stats,
    permissionActions,
    adminResources,
    pageContentDefaults,
    pageContent,
    allOpenings,
    showcaseItems
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
  },

  updatePageContent: async ({ locals, request }) => {
    const actingUser = getRequiredAdminUser(locals);

    const form = await request.formData();
    const pagePath = String(form.get('pagePath') ?? '').trim() as PageContentPath;
    const rawContent = String(form.get('contentJson') ?? '').trim();

    if (!(pagePath in pageContentDefaults)) {
      return fail(400, { error: 'Invalid page path for content update.' });
    }

    if (!rawContent) {
      return fail(400, { error: 'Missing content JSON.' });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return fail(400, { error: 'Content must be valid JSON.' });
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return fail(400, { error: 'Content JSON must be an object.' });
    }

    await upsertPageContent(pagePath, parsed, actingUser.id);
    return { success: `Updated page content for ${pagePath}.` };
  },

  upsertShowcaseItem: async ({ locals, request }) => {
    const actingUser = getRequiredAdminUser(locals);

    const form = await request.formData();
    const imageUrl = String(form.get('imageUrl') ?? '').trim();
    const category = String(form.get('category') ?? '').trim();
    const title = String(form.get('title') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const ownerId = String(form.get('ownerId') ?? '').trim();
    const isActiveRaw = String(form.get('isActive') ?? 'true').trim().toLowerCase();

    if (!imageUrl || !category) {
      return fail(400, { error: 'Showcase image URL and category are required.' });
    }

    await upsertShowcaseItem({
      imageUrl,
      category,
      title: title || null,
      description: description || null,
      ownerId: ownerId || null,
      isActive: isActiveRaw !== 'false',
      actorId: actingUser.id
    });

    return { success: `Saved showcase metadata for ${imageUrl}.` };
  },

  deleteShowcaseItem: async ({ locals, request }) => {
    getRequiredAdminUser(locals);
    const form = await request.formData();
    const imageUrl = String(form.get('imageUrl') ?? '').trim();

    if (!imageUrl) {
      return fail(400, { error: 'Showcase image URL is required for delete.' });
    }

    await removeShowcaseItem(imageUrl);
    return { success: `Deleted showcase metadata for ${imageUrl}.` };
  },

  updateDepartmentPost: async ({ locals, request }) => {
    getRequiredAdminUser(locals);
    const form = await request.formData();
    const openingId = String(form.get('openingId') ?? '').trim();
    const title = String(form.get('title') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const category = String(form.get('category') ?? '').trim();
    const contact = String(form.get('contact') ?? '').trim();
    const tagsRaw = String(form.get('tags') ?? '').trim();

    if (!openingId) {
      return fail(400, { error: 'Opening id is required for update.' });
    }

    const patch: {
      title?: string;
      description?: string;
      category?: 'Business' | 'Gang' | 'Department';
      tags?: string[];
      contact?: string;
    } = {};

    if (title) patch.title = title;
    if (description) patch.description = description;
    if (category === 'Business' || category === 'Gang' || category === 'Department') {
      patch.category = category;
    }
    if (contact) patch.contact = contact;
    if (tagsRaw) {
      patch.tags = tagsRaw
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 8);
    }

    if (Object.keys(patch).length === 0) {
      return fail(400, { error: 'Provide at least one field to update.' });
    }

    const result = await updateOpeningById(openingId, patch);
    if (result === 'not_found') {
      return fail(404, { error: 'Opening not found.' });
    }

    return { success: `Updated opening ${openingId}.` };
  },

  deleteDepartmentPost: async ({ locals, request }) => {
    getRequiredAdminUser(locals);
    const form = await request.formData();
    const openingId = String(form.get('openingId') ?? '').trim();

    if (!openingId) {
      return fail(400, { error: 'Opening id is required for delete.' });
    }

    const result = await deleteOpeningById(openingId);
    if (result === 'not_found') {
      return fail(404, { error: 'Opening not found.' });
    }

    return { success: `Deleted opening ${openingId}.` };
  },

  transferDepartmentOwnership: async ({ locals, request }) => {
    getRequiredAdminUser(locals);
    const form = await request.formData();
    const openingId = String(form.get('openingId') ?? '').trim();
    const newOwnerId = String(form.get('newOwnerId') ?? '').trim();
    const newOwnerName = String(form.get('newOwnerName') ?? '').trim();

    if (!openingId || !newOwnerId || !newOwnerName) {
      return fail(400, { error: 'Opening id, new owner id, and owner name are required.' });
    }

    const result = await transferOpeningOwnership(openingId, newOwnerId, newOwnerName);
    if (result === 'not_found') {
      return fail(404, { error: 'Opening not found.' });
    }

    return { success: `Transferred opening ${openingId} ownership to ${newOwnerId}.` };
  }
};
