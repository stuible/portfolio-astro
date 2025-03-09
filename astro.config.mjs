import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { defineConfig } from 'astro/config';

import vue from "@astrojs/vue";

// https://astro.build/config
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import behead from 'remark-behead';


// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '~/': `${path.resolve(__dirname, 'src')}/`
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          // path to your scss variables
          additionalData: `@use "sass:math"; @use "~/assets/scss/variables.scss" as *; @use "~/assets/scss/breakpoints.scss" as *;  @use "~/assets/scss/design-system.scss" as *;`
        }
      }
    },
    ssr: {
      noExternal: ['floating-vue']
    }
  },
  site: "https://stuible.com",
  integrations: [vue(), mdx(), sitemap()],
  markdown: {
    remarkPlugins: [[behead, {
      depth: 1
    }]]
  }
});