import { getEntry } from "astro:content";

const icons = Object.values(
  import.meta.glob<{ default: { src: string } }>("~/assets/icons/*.svg", {
    eager: true,
  })
).map((x) => x.default.src);

/**
 * All tech from `src/content/categories/tech.md`, with each item's icon
 * resolved to its built asset URL.
 */
export async function getTechWithIcons() {
  const entry = await getEntry("categories", "tech");
  if (!entry) {
    throw new Error(
      "Missing tech category entry (src/content/categories/tech.md)"
    );
  }

  return (entry.data.tech as any[]).map((item) => ({
    ...item,
    icon: icons.find((x) => x.includes(item.icon)),
  }));
}

/**
 * Resolves tech slugs (e.g. a project's `tags`) to tech items, failing the
 * build on any slug that isn't defined in the tech category.
 */
export async function getTechBySlugs(slugs: string[]) {
  const tech = await getTechWithIcons();

  return slugs.map((slug) => {
    const item = tech.find((x) => x.slug === slug);
    if (!item) throw new Error(`Unknown tech tag "${slug}"`);
    return item;
  });
}
