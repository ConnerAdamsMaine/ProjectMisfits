import { closeOpeningById } from '$lib/server/openings-store';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Discord login required');
  }

  const openingId = params.id;
  if (!openingId) {
    throw error(400, 'Missing opening id');
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
