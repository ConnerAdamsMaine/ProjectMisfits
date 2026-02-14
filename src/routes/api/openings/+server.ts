import crypto from 'node:crypto';
import { addOpening, getOpenings } from '$lib/server/openings-store';
import { categories } from '$lib/types';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().trim().min(4).max(80),
  description: z.string().trim().min(15).max(360),
  category: z.enum(categories),
  tags: z.string().trim().max(120).optional().default(''),
  contact: z.string().trim().min(3).max(120)
});

export const GET: RequestHandler = async () => {
  const openings = await getOpenings();
  return json({ openings });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Discord login required');
  }

  const formData = await request.formData();
  const parsed = createSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    tags: formData.get('tags') || '',
    contact: formData.get('contact')
  });

  if (!parsed.success) {
    throw error(400, 'Invalid opening payload');
  }

  const tags = parsed.data.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 8);

  const opening = {
    id: crypto.randomUUID(),
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    tags,
    contact: parsed.data.contact,
    authorId: locals.user.id,
    authorName: locals.user.username,
    createdAt: new Date().toISOString()
  };

  await addOpening(opening);

  return json({ opening }, { status: 201 });
};
