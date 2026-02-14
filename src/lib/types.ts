export const categories = ['Business', 'Gang', 'Department'] as const;

export type OpeningCategory = (typeof categories)[number];

export interface Opening {
  id: string;
  title: string;
  description: string;
  category: OpeningCategory;
  tags: string[];
  contact: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}
