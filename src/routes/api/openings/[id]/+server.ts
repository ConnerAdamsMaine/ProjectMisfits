import { userHasPermission } from '$lib/server/admin-store';
import { categories } from '$lib/types';
import { closeOpeningById, deleteOpeningById, transferOpeningOwnership, updateOpeningById } from '$lib/server/openings-store';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().trim().min(4).max(80).optional(),
  description: z.string().trim().min(15).max(360).optional(),
  category: z.enum(categories).optional(),
  tags: z.array(z.string().trim().min(1).max(24)).max(8).optional(),
  contact: z.string().trim().min(3).max(120).optional()
});

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Discord login required');
  }

  const openingId = params.id;
  if (!openingId) {
    throw error(400, 'Missing opening id');
  }

  const canDeleteAny = locals.isAdmin && (await userHasPermission(locals.user.id, 'departments:posts', 'delete'));

  if (canDeleteAny) {
    const deleted = await deleteOpeningById(openingId);
    if (deleted === 'not_found') {
      throw error(404, 'Opening not found');
    }

    return json({ status: 'deleted' });
  }

  const result = await closeOpeningById(openingId, locals.user.id);

  if (result === 'not_found') {
    throw error(404, 'Opening not found');
  }

  if (result === 'forbidden') {
    throw error(403, 'You can only close openings you posted');
  }

  if (result === 'already_closed') {
    return json({ status: 'already_closed' });
  }

  return json({ status: 'closed' });
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Discord login required');
  }

  const openingId = params.id;
  if (!openingId) {
    throw error(400, 'Missing opening id');
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    throw error(400, 'Invalid payload');
  }

  const action = String((payload as Record<string, unknown>).action ?? 'update');

  if (action === 'transfer_owner') {
    const canTransfer =
      locals.isAdmin && (await userHasPermission(locals.user.id, 'departments:posts', 'modify'));
    if (!canTransfer) {
      throw error(403, 'Missing permission for ownership transfer');
    }

    const newOwnerId = String((payload as Record<string, unknown>).newOwnerId ?? '').trim();
    const newOwnerName = String((payload as Record<string, unknown>).newOwnerName ?? '').trim();
    if (!newOwnerId || !newOwnerName) {
      throw error(400, 'Missing new owner id or name');
    }

    const transferred = await transferOpeningOwnership(openingId, newOwnerId, newOwnerName);
    if (transferred === 'not_found') {
      throw error(404, 'Opening not found');
    }

    return json({ status: 'transferred' });
  }

  const canModify = locals.isAdmin && (await userHasPermission(locals.user.id, 'departments:posts', 'modify'));
  if (!canModify) {
    throw error(403, 'Missing permission for opening update');
  }

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    throw error(400, 'Invalid opening update payload');
  }

  const updated = await updateOpeningById(openingId, parsed.data);
  if (updated === 'not_found') {
    throw error(404, 'Opening not found');
  }

  return json({ status: 'updated' });
};
