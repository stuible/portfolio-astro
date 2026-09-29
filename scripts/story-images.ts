// Generates a 1080×1920 Instagram story image for a project, in the same style
// as the Open Graph images: logo, date, title, subtitle and the project's tech
// badges. The markup and styles live in src/components/social/Story.astro.
//
//   npm run generate:story pt-med            # one project
//   npm run generate:story pt-med act-ap     # several
//
// Images are written to dist/social-stories/<slug>.png. `astro build` clears
// dist/, so run this after building.

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getViteConfig } from "astro/config";
import { render } from "takumi-js";
// Installed with takumi-js; its Renderer is the only way to register fonts
import { Renderer } from "@takumi-rs/core";
import { createServer, type PluginOption } from "vite";
import { parse } from "yaml";
import type { Props as StoryProps } from "../src/components/social/Story.astro";

interface Tech {
  slug: string;
  name: string;
  icon?: string;
  colour?: string;
}

interface Project {
  slug: string;
  title: string;
  subtitle: string;
  when?: string;
  tags?: string[];
  enabled?: boolean;
}

const root = resolve(import.meta.dirname, "..");
const fromRoot = (...parts: string[]) => resolve(root, ...parts);

function frontmatter<T>(source: string, file: string): T {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`No frontmatter in ${file}`);
  return parse(match[1]) as T;
}

const dataUri = (buffer: Buffer, type: string) =>
  `data:${type};base64,${buffer.toString("base64")}`;

async function loadRenderer() {
  const renderer = new Renderer();
  const font = (file: string) =>
    readFile(fromRoot("src/assets/fonts/graphik", file));
  await renderer.registerFont({
    name: "Graphik",
    data: await font("Graphik-Regular.woff"),
    weight: 400,
  });
  await renderer.registerFont({
    name: "Graphik",
    data: await font("Graphik-Medium.woff"),
    weight: 500,
  });
  return renderer;
}

// Mirrors src/lib/tech.ts: each tech item's `icon` names an SVG in src/assets/icons
async function loadTech(): Promise<Tech[]> {
  const file = fromRoot("src/content/categories/tech.md");
  const { tech } = frontmatter<{ tech: Tech[] }>(
    await readFile(file, "utf8"),
    file
  );
  const iconDir = fromRoot("src/assets/icons");
  const iconFiles = await readdir(iconDir);

  return Promise.all(
    tech.map(async (item) => {
      const iconFile =
        item.icon && iconFiles.find((x) => x.includes(item.icon!));
      return {
        ...item,
        icon: iconFile
          ? dataUri(await readFile(resolve(iconDir, iconFile)), "image/svg+xml")
          : undefined,
      };
    })
  );
}

async function loadProjects(): Promise<Project[]> {
  const dir = fromRoot("src/content/projects");
  const files = (await readdir(dir)).filter((x) => x.endsWith(".mdx"));

  return Promise.all(
    files.map(async (file) => ({
      ...frontmatter<Omit<Project, "slug">>(
        await readFile(resolve(dir, file), "utf8"),
        file
      ),
      slug: file.replace(/\.mdx$/, ""),
    }))
  );
}

// .astro components need Astro's compiler, so load the Story component (and the
// Container API that renders it) through a Vite server set up with the site's
// Astro config
async function loadStoryHtml() {
  const config = await getViteConfig({
    appType: "custom",
    // Separate from the dev server's cache so neither invalidates the other
    cacheDir: "node_modules/.vite-social-stories",
    logLevel: "error",
    server: { middlewareMode: true, hmr: false, watch: null },
  })({ command: "serve", mode: "development" });
  // astro:server boots the dev request handler in the background and logs an
  // error if the server closes first; nothing here serves requests, so drop it
  const plugins = ((config.plugins ?? []) as unknown[])
    .flat(Infinity)
    .filter(
      (x) =>
        !(
          x &&
          typeof x === "object" &&
          "name" in x &&
          x.name === "astro:server"
        )
    ) as PluginOption[];
  const vite = await createServer({ ...config, plugins, configFile: false });
  const [{ experimental_AstroContainer }, { default: Story }] =
    await Promise.all([
      vite.ssrLoadModule("astro/container") as Promise<
        typeof import("astro/container")
      >,
      vite.ssrLoadModule(fromRoot("src/components/social/Story.astro")),
    ]);
  const container = await experimental_AstroContainer.create();

  return {
    renderStoryHtml: (props: StoryProps) =>
      container.renderToString(Story, {
        props: { ...props } as Record<string, unknown>,
      }),
    close: () => vite.close(),
  };
}

const [tech, allProjects] = await Promise.all([loadTech(), loadProjects()]);

const slugs = process.argv.slice(2);
const available = allProjects
  .filter((x) => x.enabled !== false)
  .map((x) => x.slug)
  .join(", ");

if (slugs.length === 0) {
  console.error(
    `Usage: npm run generate:story <project-slug> [...more]\nProjects: ${available}`
  );
  process.exit(1);
}

const projects = slugs.map((slug) => {
  const project = allProjects.find((x) => x.slug === slug);
  if (!project) {
    console.error(`Unknown project "${slug}". Projects: ${available}`);
    process.exit(1);
  }
  return project;
});

const [renderer, logo, { renderStoryHtml, close }] = await Promise.all([
  loadRenderer(),
  readFile(fromRoot("src/assets/images/jslogo.png")).then((x) =>
    dataUri(x, "image/png")
  ),
  loadStoryHtml(),
]);

const outDir = fromRoot("dist/social-stories");
await mkdir(outDir, { recursive: true });

try {
  for (const project of projects) {
    const badges = (project.tags ?? []).map((slug) => {
      const item = tech.find((x) => x.slug === slug);
      if (!item)
        throw new Error(`Unknown tech tag "${slug}" in ${project.slug}`);
      return { name: item.name, icon: item.icon, colour: item.colour };
    });

    const html = await renderStoryHtml({
      title: project.title,
      subtitle: project.subtitle,
      when: project.when,
      url: `stuible.com/project/${project.slug}`,
      logo,
      badges,
    });

    const png = await render(html, {
      renderer,
      width: 1080,
      height: 1920,
      format: "png",
    });
    await writeFile(resolve(outDir, `${project.slug}.png`), png);
    console.log(`dist/social-stories/${project.slug}.png`);
  }
} finally {
  await close();
}
