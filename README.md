# SVCC Website

Production-ready static site for Silicon Valley College Church, built with Astro and Bun.

## Tech Stack

| Tool | Version |
|------|---------|
| Astro | 5.x |
| Bun | latest |
| TypeScript | strict mode |
| Tailwind CSS | v3 |
| @astrojs/tailwind | latest |
| @astrojs/sitemap | latest |
| Prettier | latest |

## Prerequisites

- **Bun** — [https://bun.sh/docs/installation](https://bun.sh/docs/installation)

Node 18+ is bundled with Bun; no separate Node installation required.

## Local Setup

```bash
git clone <repo-url>
cd svc
bun install
```

## Development

```bash
bun run dev
```

Opens at [http://localhost:4321](http://localhost:4321).

## Build

```bash
bun run build
```

Outputs to `dist/`. To preview the production build locally:

```bash
bun run preview
```

## Formatting

```bash
# Format all files
bun run format

# Check formatting without writing
bun run format:check
```

## Project Structure

```
/
├── public/
│   ├── images/          # Logo assets
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Nav.astro    # Fixed navigation with mobile menu
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── BaseLayout.astro  # Shared layout: SEO, OG tags, canonical URL
│   ├── pages/
│   │   ├── index.astro  # Homepage
│   │   └── about.astro  # About page
│   └── styles/
│       └── global.css   # Tailwind directives + scroll animation utilities
├── astro.config.mjs
├── tailwind.config.mjs
└── tsconfig.json
```

## Deployment

This is a fully static site. Deploy the `dist/` folder to any static host.

Compatible hosts include:
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

Before deploying, update the `site` field in `astro.config.mjs` to match the production domain. This is required for sitemap generation and OG image URLs to resolve correctly.

## SEO

`BaseLayout.astro` accepts the following props:

| Prop | Purpose |
|------|---------|
| `title` | Page `<title>` tag |
| `description` | Meta description |
| `ogImage` | Open Graph image URL |
| `canonicalUrl` | Canonical URL override |

- Sitemap auto-generated at `/sitemap-index.xml`
- `robots.txt` served at `/robots.txt`
