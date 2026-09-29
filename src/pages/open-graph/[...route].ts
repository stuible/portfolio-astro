import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";
import type { FontConfig } from "node_modules/astro-og-canvas/dist/types";

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

const projects = await getCollection("projects");

// Keyed as projects/<id> so images are served at /open-graph/projects/<id>.png
const pages = Object.fromEntries(
  projects.map(({ id, data }) => [`projects/${id}`, data])
);

export const { getStaticPaths, GET } = await OGImageRoute({
  // A collection of pages to generate images for.
  // This can be any map of paths to data, not necessarily a glob result.
  pages: pages,

  // For each page, this callback will be used to customize the OpenGraph
  // image. `page` is the project entry's frontmatter data.
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.subtitle,

    logo: {
      path: "./src/assets/images/jslogo.png",
      size: [200],
    },
    bgGradient: [[255, 255, 255]],

    fonts,

    padding: 100,

    font: {
      title: titleFont,
      description: descriptionFont,
    },
    // There are a bunch more options you can use here!
  }),
});
