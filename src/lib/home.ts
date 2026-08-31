import { getEntry } from "astro:content";

/**
 * Editable content for the landing page, from `src/content/pages/home.md`.
 */
export async function getHomeContent() {
  const home = await getEntry("pages", "home");
  if (!home) {
    throw new Error("Missing home page content entry (src/content/pages/home.md)");
  }
  return home.data;
}
