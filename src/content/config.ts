// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';
import { type TreeNode } from '../components/project/TreeNode.astro';
// 2. Define a schema for each collection you'd like to validate.

const treeNodeSchema: z.ZodSchema<TreeNode[]> = z.lazy(() =>
  z.array(
    z.object({
      name: z.string(),
      children: treeNodeSchema.optional(),
    })
  )
);


const projectCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    tags: z.array(z.string()).optional(),
    stack: treeNodeSchema.optional(),
  }),
});
// 3. Export a single `collections` object to register your collection(s)
export const collections = {
  'projects': projectCollection,
};