import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

const DISCORD_API = 'https://discord.com/api/v10';
const secure = process.env.NODE_ENV === 'production';

function discordConfig(origin: string) {
  const clientId = env.DISCORD_CLIENT_ID;
  const clientSecret = env.DISCORD_CLIENT_SECRET;
  const redirectUri = env.DISCORD_REDIRECT_URI || `${origin}/api/auth/discord/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri
  };
}

export function setStateCookie(cookies: Cookies): string {
  const state = crypto.randomBytes(24).toString('hex');
  cookies.set('pm_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 60 * 10
  });
  return state;
}

export function validateState(cookies: Cookies, state: string | null): boolean {
  const expectedState = cookies.get('pm_oauth_state');
  cookies.delete('pm_oauth_state', { path: '/', secure });
  return Boolean(expectedState && state && expectedState === state);
}

export function buildAuthorizeUrl(origin: string, state: string): string {
  const { clientId, redirectUri } = discordConfig(origin);

  if (!clientId) {
    throw new Error('Missing DISCORD_CLIENT_ID');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'identify',
    prompt: 'consent',
    state
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForUser(code: string, origin: string): Promise<{
  id: string;
  username: string;
  avatarUrl: string | null;
}> {
  const { clientId, clientSecret, redirectUri } = discordConfig(origin);

  if (!clientId || !clientSecret) {
    throw new Error('Discord OAuth credentials are not configured.');
  }

  const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });

  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed with status ${tokenRes.status}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error('No access token returned by Discord.');
  }

  const userRes = await fetch(`${DISCORD_API}/users/@me`, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  if (!userRes.ok) {
    throw new Error(`Fetching user failed with status ${userRes.status}`);
  }

  const discordUser = (await userRes.json()) as {
    id: string;
    username: string;
    avatar: string | null;
  };

  return {
    id: discordUser.id,
    username: discordUser.username,
    avatarUrl: discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null
  };
}
