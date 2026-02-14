import { exchangeCodeForUser, validateState } from '$lib/server/discord-auth';
import { redirect, type RequestHandler } from '@sveltejs/kit';

const secure = process.env.NODE_ENV === 'production';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!validateState(cookies, state) || !code) {
    throw redirect(302, '/departments?auth=failed');
  }

  try {
    const user = await exchangeCodeForUser(code, url.origin);

    cookies.set('pm_session', JSON.stringify(user), {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    throw redirect(302, '/departments?auth=success');
  } catch {
    throw redirect(302, '/departments?auth=failed');
  }
};
