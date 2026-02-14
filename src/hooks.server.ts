import type { Handle } from '@sveltejs/kit';
import { getUserBySessionId } from '$lib/server/session-store';

const secure = process.env.NODE_ENV === 'production';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('pm_session');

  if (sessionId) {
    try {
      const user = await getUserBySessionId(sessionId);

      if (!user) {
        event.cookies.delete('pm_session', { path: '/', secure });
      }

      event.locals.user = user;
    } catch {
      event.locals.user = null;
      event.cookies.delete('pm_session', {
        path: '/',
        secure
      });
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
