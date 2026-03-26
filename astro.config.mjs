// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // TODO: update to https://svcollegechurch.org when domain is live
  site: 'https://sv-college-church.github.io',
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  output: 'static',
});
