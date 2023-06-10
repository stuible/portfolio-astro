import { OGImageRoute } from 'astro-og-canvas';
import { FontConfig } from 'astro-og-canvas/dist/types';

const fontConfig: FontConfig = {
    color: [0, 0, 0]
}

const directory = "/src/content";

// Import all pages from the content directory
const rawPages = await import.meta.glob('/src/content/projects/**/*.mdx', { eager: true });

// Remove the /src/content prefix from the paths
const pages = Object.entries(rawPages).reduce(
    (acc, [path, page]) => ({ ...acc, [path.replace(directory, "")]: page }),
    {}
);

export const { getStaticPaths, get } = OGImageRoute({
    // Tell us the name of your dynamic route segment.
    // In this case it’s `route`, because the file is named `[...route].ts`.
    param: 'route',

    // A collection of pages to generate images for.
    // This can be any map of paths to data, not necessarily a glob result.
    pages: pages,

    // For each page, this callback will be used to customize the OpenGraph
    // image. For example, if `pages` was passed a glob like above, you
    // could read values from frontmatter.
    getImageOptions: (path, page) => ({
        title: page.frontmatter.title,
        description: page.frontmatter.subtitle,

        logo: {
            path: './src/assets/images/jslogo.png',
            size: [200]
        },
        bgGradient: [[255, 255, 255]],

        // fonts: [""],

        font: {
            title: fontConfig,
            description: fontConfig,
        }
        // There are a bunch more options you can use here!
    }),
});
