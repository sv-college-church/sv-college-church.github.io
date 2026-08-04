// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://svcollegechurch.org',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    // Keep noindex pages (drafts behind feature flags) out of the sitemap so we
    // aren't asking Google to crawl pages we've told it to ignore.
    sitemap({
      filter: (page) => !page.includes('/campuses/sjsu/connect-groups'),
    }),
  ],
  output: 'static',
});
