import type { Handle } from '@sveltejs/kit';

const secure = process.env.NODE_ENV === 'production';

export const handle: Handle = async ({ event, resolve }) => {
  const rawSession = event.cookies.get('pm_session');

  if (rawSession) {
    try {
      const session = JSON.parse(rawSession) as {
        id?: string;
        username?: string;
        avatarUrl?: string | null;
      };

      if (session.id && session.username) {
        event.locals.user = {
          id: session.id,
          username: session.username,
          avatarUrl: session.avatarUrl ?? null
        };
      } else {
        event.locals.user = null;
      }
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
