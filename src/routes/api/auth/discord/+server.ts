import { buildAuthorizeUrl, setStateCookie } from '$lib/server/discord-auth';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const state = setStateCookie(cookies);
  const authorizeUrl = buildAuthorizeUrl(url.origin, state);
  throw redirect(302, authorizeUrl);
};
