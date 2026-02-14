import type { Handle } from '@sveltejs/kit';
import { userCanViewPage, userHasAdminAccess } from '$lib/server/admin-store';
import { getUserBySessionId } from '$lib/server/session-store';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const secure = process.env.NODE_ENV === 'production';
const adminAllowList = new Set(
  (env.ADMIN_DISCORD_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
);

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('pm_session');

  if (sessionId) {
    try {
      const user = await getUserBySessionId(sessionId);

      if (!user) {
        event.cookies.delete('pm_session', { path: '/', secure });
      }

      event.locals.user = user;
      event.locals.isAdmin = user
        ? adminAllowList.has(user.id) || (await userHasAdminAccess(user.id))
        : false;
    } catch {
      event.locals.user = null;
      event.locals.isAdmin = false;
      event.cookies.delete('pm_session', {
        path: '/',
        secure
      });
    }
  } else {
    event.locals.user = null;
    event.locals.isAdmin = false;
  }

  const path = event.url.pathname;
  const isPathCheckable =
    !path.startsWith('/api/') && !path.startsWith('/_app/') && !path.startsWith('/favicon');

  if (isPathCheckable) {
    const canView = event.locals.isAdmin
      ? true
      : await userCanViewPage(event.locals.user?.id ?? null, path);

    if (!canView) {
      throw redirect(303, '/departments?access=denied');
    }
  }

  return resolve(event);
};
