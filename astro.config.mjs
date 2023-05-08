import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { defineConfig } from 'astro/config';

// https://astro.build/config
import vue from "@astrojs/vue";

// https://astro.build/config
import image from "@astrojs/image";

// https://astro.build/config
import mdx from "@astrojs/mdx";

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
          additionalData: `@use "sass:math"; @import "~/assets/scss/variables.scss"; @import "~/assets/scss/breakpoints.scss";`
        }
      }
    },
    ssr: { noExternal: ['floating-vue'] }
  },
  integrations: [
    vue(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp'
    }),
    mdx()
  ],
  markdown: {
    remarkPlugins: [[behead, { depth: 1 }]]
  }
});