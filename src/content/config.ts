// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';
import { type TreeNode } from '~/types';
// 2. Define a schema for each collection you'd like to validate.

const treeNodeSchema: z.ZodSchema = z.lazy(() =>
  z.array(
    z.object({
      name: z.string(),
      url: z.string().url().optional(),
      children: treeNodeSchema.optional(),
    })
  )
);


const projectCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    when: z.string().optional(),
    subtitle: z.string(),
    tldr: z.string().optional(),
    tags: z.array(z.string()),
    stack: treeNodeSchema.optional(),
    link: z.string().url().optional(),
    enabled: z.boolean().default(true),
  }),
});

const pageCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    bio: z.string(),
    thought: z.object({
      text: z.string(),
      url: z.string().url().optional(),
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
  categories: defineCollection({}),
  pages: pageCollection,
  'project-lists': defineCollection({
    schema: z.object({
      title: z.string(),
      projects: z.array(z.string()),
    }),
  }),
};
