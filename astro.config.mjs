import { fileURLToPath } from "url";
import path, { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { defineConfig } from "astro/config";

import vue from "@astrojs/vue";

// https://astro.build/config
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import behead from "remark-behead";
import { unified } from "@astrojs/markdown-remark";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "~/": `${path.resolve(__dirname, "src")}/`,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // path to your scss variables
          additionalData: `@use "sass:math"; @use "~/assets/scss/variables.scss" as *; @use "~/assets/scss/breakpoints.scss" as *;  @use "~/assets/scss/design-system.scss" as *;`,
        },
      },
    },
    ssr: {
      noExternal: ["floating-vue"],
    },
  },
  site: "https://stuible.com",
  // Inline all CSS so it doesn't block rendering; each page's CSS is small.
  build: {
    inlineStylesheets: "always",
  },
  // Astro 7 defaults to JSX whitespace rules, which drop the spaces around
  // inline elements (e.g. "by <a>Josh Stuible</a> in Vancouver")
  compressHTML: true,
  integrations: [
    vue(),
    mdx(),
    sitemap({
      // Custom project lists are for sending to specific clients, not search
      filter: (page) => !/\/projects\/[^/]+\/$/.test(new URL(page).pathname),
    }),
    icon({ iconDir: "src/assets/icons" }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        [
          behead,
          {
            depth: 1,
          },
        ],
      ],
    }),
  },
});
