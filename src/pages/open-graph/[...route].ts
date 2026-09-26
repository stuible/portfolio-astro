import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { OGImageRoute } from 'astro-og-canvas';
import type { FontConfig } from 'node_modules/astro-og-canvas/dist/types';

// astro-og-canvas reads fonts relative to the working directory and silently
// falls back to its default font (or hangs) if one can't be read, so resolve
// them from the project root and fail the build if any are missing.
const fonts = [
    "src/assets/fonts/graphik/Graphik-Regular.woff",
    "src/assets/fonts/graphik/Graphik-Medium.woff",
].map((font) => resolve(process.cwd(), font));

for (const font of fonts) {
    if (!existsSync(font)) {
        throw new Error(`Missing Open Graph font: ${font}`);
    }
}

const titleFont: FontConfig = {
    color: [0, 0, 0],
    families: ["Graphik"],
    weight: "Medium",
};

const descriptionFont: FontConfig = {
    color: [0, 0, 0],
    families: ["Graphik"],
    weight: "Normal",
};

const directory = "/src/content/";

// Import all pages from the content directory
const rawPages = import.meta.glob('/src/content/projects/**/*.mdx', { eager: true });

// Remove the /src/content prefix from the paths
const pages = Object.entries(rawPages).reduce(
    (acc, [path, page]) => ({ ...acc, [path.replace(directory, "")]: page }),
    {}
);

export const { getStaticPaths, GET } = OGImageRoute({
    // Tell us the name of your dynamic route segment.
    // In this case it’s `route`, because the file is named `[...route].ts`.
    param: 'route',

    // A collection of pages to generate images for.
    // This can be any map of paths to data, not necessarily a glob result.
    pages: pages,

    // For each page, this callback will be used to customize the OpenGraph
    // image. For example, if `pages` was passed a glob like above, you
    // could read values from frontmatter.
    getImageOptions: (_path, page) => ({
        title: page.frontmatter.title,
        description: page.frontmatter.subtitle,

        logo: {
            path: './src/assets/images/jslogo.png',
            size: [200]
        },
        bgGradient: [[255, 255, 255]],

        fonts,

        padding: 100,

        font: {
            title: titleFont,
            description: descriptionFont,
        }
        // There are a bunch more options you can use here!
    }),
});
