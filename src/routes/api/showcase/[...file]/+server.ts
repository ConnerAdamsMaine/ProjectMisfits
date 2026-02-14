import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { error, type RequestHandler } from '@sveltejs/kit';

const mimeByExt: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

export const GET: RequestHandler = async ({ params }) => {
  const raw = params.file;

  if (!raw) {
    throw error(404, 'Not found');
  }

  const decoded = decodeURIComponent(raw);
  const normalized = path.posix.normalize(decoded).replace(/^\/+/, '');

  if (normalized.includes('..')) {
    throw error(400, 'Invalid file path');
  }

  const abs = path.resolve(process.cwd(), 'assets/showcase', normalized);
  const base = path.resolve(process.cwd(), 'assets/showcase');

  if (!abs.startsWith(base)) {
    throw error(400, 'Invalid file path');
  }

  const ext = path.extname(abs).toLowerCase();
  const mime = mimeByExt[ext];

  if (!mime) {
    throw error(404, 'Unsupported file type');
  }

  try {
    const data = await readFile(abs);
    return new Response(data, {
      headers: {
        'content-type': mime,
        'cache-control': 'public, max-age=300'
      }
    });
  } catch {
    throw error(404, 'File not found');
  }
};
