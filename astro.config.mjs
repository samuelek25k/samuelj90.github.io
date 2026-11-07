import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://samuelj90.github.io',
  build: {
    format: 'directory', // Generates /blog/index.html so /blog/ resolves cleanly on GitHub Pages
  },
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
  ],
});
