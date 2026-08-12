// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://svcollegechurch.org',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    // Keep noindex pages (drafts behind feature flags, redirect stubs) out of
    // the sitemap so we aren't asking Google to crawl pages we've told it to
    // ignore.
    sitemap({
      filter: (page) =>
        !page.includes('/campuses/sjsu/connect-groups') && !page.includes('/campus-ministries/'),
    }),
  ],
  // GitHub Pages can't serve real 301s, so Astro builds each entry into a
  // static stub with a zero-delay meta refresh, noindex, and a canonical tag
  // pointing at the destination — which search engines treat as a redirect.
  redirects: {
    '/campus-ministries/ucsc-klesis': '/campuses/ucsc/',
  },
  output: 'static',
});
