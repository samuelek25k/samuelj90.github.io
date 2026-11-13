import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const accent = z.enum(['teal', 'purple', 'amber', 'green', 'indigo', 'red']);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    readingTime: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    accent,
    order: z.number().int().positive(),
    repo: z.url(),
    description: z.string(),
    impact: z.string().optional(),
    stack: z.array(z.string()).min(1),
  }),
});

export const collections = { blog, projects };
