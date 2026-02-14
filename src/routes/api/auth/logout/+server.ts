import { redirect, type RequestHandler } from '@sveltejs/kit';

const secure = process.env.NODE_ENV === 'production';

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete('pm_session', { path: '/', secure });
  throw redirect(303, '/departments');
};
