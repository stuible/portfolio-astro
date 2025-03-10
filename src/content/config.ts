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
    tags: z.array(z.string()).optional(),
    stack: treeNodeSchema.optional(),
    link: z.string().url().optional(),
    enabled: z.boolean().default(true),
  }),
});
// 3. Export a single `collections` object to register your collection(s)
export const collections = {
  'projects': projectCollection,
  categories: defineCollection({}),
  pages: defineCollection({}),
  'project-lists': defineCollection({}),
};