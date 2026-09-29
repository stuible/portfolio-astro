// 1. Import utilities from `astro:content`, `astro/loaders` and `astro/zod`
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
// 2. Define a schema for each collection you'd like to validate.

const treeNodeSchema: z.ZodType = z.lazy(() =>
  z.array(
    z.object({
      name: z.string(),
      url: z.url().optional(),
      children: treeNodeSchema.optional(),
    })
  )
);

const contentLoader = (collection: string) =>
  glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${collection}` });

const projectCollection = defineCollection({
  loader: contentLoader('projects'),
  schema: z.object({
    title: z.string(),
    when: z.string().optional(),
    subtitle: z.string(),
    tldr: z.string().optional(),
    tags: z.array(z.string()),
    stack: treeNodeSchema.optional(),
    link: z.url().optional(),
    enabled: z.boolean().default(true),
  }),
});

const pageCollection = defineCollection({
  loader: contentLoader('pages'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    bio: z.string(),
    thought: z.object({
      text: z.string(),
      url: z.url().optional(),
      updatedAt: z.string(),
    }),
    skills: z.object({
      body: z.string(),
      exclude: z.array(z.string()).default([]),
    }),
    projects: z.array(z.string()),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
export const collections = {
  'projects': projectCollection,
  categories: defineCollection({ loader: contentLoader('categories') }),
  pages: pageCollection,
  'project-lists': defineCollection({
    loader: contentLoader('project-lists'),
    schema: z.object({
      title: z.string(),
      projects: z.array(z.string()),
    }),
  }),
};
