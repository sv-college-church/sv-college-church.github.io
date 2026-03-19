// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sv-college-church.github.io',
  base: '/svc/',
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  output: 'static',
});
