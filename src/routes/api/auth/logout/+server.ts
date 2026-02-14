import { redirect, type RequestHandler } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/session-store';

const secure = process.env.NODE_ENV === 'production';

export const POST: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('pm_session');
  if (sessionId) {
    await deleteSession(sessionId);
  }

  cookies.delete('pm_session', { path: '/', secure });
  throw redirect(303, '/departments');
};
