# SVCC Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready Astro static site for Silicon Valley College Church (SVCC) — editorial aesthetic, black/white/red palette, targeting newcomers/visitors.

**Architecture:** Astro static site with TypeScript, Tailwind CSS v3, @astrojs/sitemap. Two pages (index, about). Shared BaseLayout.astro handles all SEO/OG tags. IntersectionObserver scroll animations via a lightweight inline script. No client-side JS frameworks.

**Tech Stack:** Astro 5.x (scaffolded via create-astro), Bun, TypeScript (strict), Tailwind CSS v3, @astrojs/tailwind, @astrojs/sitemap, Prettier + prettier-plugin-astro + prettier-plugin-tailwindcss

**Note:** Project was bootstrapped with `bunx create-astro@latest . --no-git`. The following already exist:

- `package.json` (minimal — needs name, format scripts, and new deps)
- `astro.config.mjs` (empty shell — needs integrations + site URL)
- `tsconfig.json` (strict — needs path aliases)
- `.gitignore`, `src/pages/index.astro` (placeholder), `public/favicon.*`, `README.md`

---

## Design Reference

- **Palette:** `#0A0A0A` (near-black / `ink`), `#F5F5F0` (off-white / `paper`), `#D91C2A` (red / `accent`)
- **Fonts (Google Fonts):** Cormorant Garamond (display/headings) + Instrument Sans (body/UI)
- **Motif:** Diagonal slash from logo echoed in layout dividers and decorative elements
- **Animation:** CSS fade-up on page load (hero), IntersectionObserver triggers `.is-visible` class on scroll
- **Logo files:** `/Users/qizhi.liu/Downloads/SVC Circle Black Logo.png` → `public/images/svc-logo-black.png`
  `/Users/qizhi.liu/Downloads/SVC Circle Logo.png` → `public/images/svc-logo-white.png`

---

## Task 1: Install dependencies + configure astro.config.mjs + fix package.json

**Files:**

- Modify: `package.json`
- Modify: `astro.config.mjs`

**Step 1: Install missing dependencies**

```bash
bun add @astrojs/tailwind @astrojs/sitemap tailwindcss@^3.4
bun add -d prettier prettier-plugin-astro prettier-plugin-tailwindcss
```

**Step 2: Update package.json**

Update `name` to `"svcc-website"` and add `format` and `format:check` scripts:

```json
{
  "name": "svcc-website",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "dependencies": {
    "@astrojs/sitemap": "...",
    "@astrojs/tailwind": "...",
    "astro": "...",
    "tailwindcss": "^3.4"
  },
  "devDependencies": {
    "prettier": "...",
    "prettier-plugin-astro": "...",
    "prettier-plugin-tailwindcss": "..."
  }
}
```

(Preserve the actual version strings from bun install — just update name and add the scripts.)

**Step 3: Update astro.config.mjs**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://svcc.church',
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  output: 'static',
});
```

**Step 4: Verify**

```bash
bun run astro -- --version
```

Expected: prints `astro  v5.x.x`

**Step 5: Commit**

```bash
git add package.json bun.lock astro.config.mjs
git commit -m "chore: install Tailwind, sitemap, Prettier; configure Astro integrations"
```

---

## Task 2: tailwind.config.mjs + tsconfig path aliases

**Files:**

- Create: `tailwind.config.mjs`
- Modify: `tsconfig.json`

**Step 1: Create tailwind.config.mjs**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        paper: '#F5F5F0',
        accent: '#D91C2A',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
```

**Step 2: Update tsconfig.json to add path aliases**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@styles/*": ["src/styles/*"]
    }
  }
}
```

**Step 3: Verify**

```bash
bun run astro check
```

Expected: 0 errors

**Step 4: Commit**

```bash
git add tailwind.config.mjs tsconfig.json
git commit -m "chore: add Tailwind config and TypeScript path aliases"
```

---

## Task 3: Developer tooling (.editorconfig, Prettier)

**Files:**

- Create: `.editorconfig`
- Create: `.prettierrc`
- Create: `.prettierignore`

**Step 1: Create .editorconfig**

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

**Step 2: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

**Step 3: Create .prettierignore**

```
dist/
node_modules/
.astro/
bun.lock
```

**Step 4: Commit**

```bash
git add .editorconfig .prettierrc .prettierignore
git commit -m "chore: add Prettier and EditorConfig"
```

---

## Task 4: Global styles, robots.txt, and logo assets

**Files:**

- Create: `src/styles/global.css`
- Create: `public/robots.txt`
- Copy: logo files to `public/images/`

**Step 1: Create src/styles/global.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Instrument+Sans:wght@400;500;600&display=swap');

@layer base {
  html {
    @apply bg-paper font-sans text-ink;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
  }

  body {
    @apply overflow-x-hidden;
  }
}

@layer utilities {
  /* Scroll animation base states */
  [data-animate] {
    opacity: 0;
    transform: translateY(28px);
    transition:
      opacity 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  [data-animate].is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  [data-animate-delay='1'] {
    transition-delay: 0.1s;
  }
  [data-animate-delay='2'] {
    transition-delay: 0.2s;
  }
  [data-animate-delay='3'] {
    transition-delay: 0.3s;
  }
  [data-animate-delay='4'] {
    transition-delay: 0.4s;
  }
  [data-animate-delay='5'] {
    transition-delay: 0.5s;
  }
}
```

**IMPORTANT:** The `@import` for Google Fonts must come AFTER the `@tailwind` directives, or move it to the top before them. Tailwind v3 processes `@import` differently — safest is to put the Google Fonts `@import` at the very top of the file, before `@tailwind base`.

Correct order:

```css
@import url('https://fonts.googleapis.com/...');

@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 2: Create public/robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://svcc.church/sitemap-index.xml
```

**Step 3: Copy logo files**

```bash
mkdir -p public/images
cp "/Users/qizhi.liu/Downloads/SVC Circle Black Logo.png" public/images/svc-logo-black.png
cp "/Users/qizhi.liu/Downloads/SVC Circle Logo.png" public/images/svc-logo-white.png
```

**Step 4: Commit**

```bash
git add src/styles/ public/robots.txt public/images/
git commit -m "chore: add global styles, fonts, robots.txt, and logo assets"
```

---

## Task 5: BaseLayout.astro

**Files:**

- Create: `src/layouts/BaseLayout.astro`

**Step 1: Create src/layouts/BaseLayout.astro**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
}

const {
  title,
  description,
  ogImage = '/images/og-default.png',
  canonicalUrl = Astro.url.href,
} = Astro.props;

const siteName = 'Silicon Valley College Church';
const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content={Astro.generator} />

    <!-- SEO -->
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site).href} />
    <meta property="og:site_name" content={siteName} />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={new URL(ogImage, Astro.site).href} />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />

    <!-- Google Fonts preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  </head>
  <body>
    <slot />

    <!-- Scroll animation observer — non-blocking, runs after paint -->
    <script>
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    </script>
  </body>
</html>
```

**Step 2: Verify**

```bash
bun run astro check
```

Expected: 0 errors

**Step 3: Commit**

```bash
git add src/layouts/
git commit -m "feat: add BaseLayout with SEO, OG tags, canonical URL, and scroll animation observer"
```

---

## Task 6: Nav component

**Files:**

- Create: `src/components/Nav.astro`

```astro
---
const navLinks = [
  { label: 'Visit', href: '/#visit' },
  { label: 'About', href: '/about' },
  { label: 'Sermons', href: '/#sermons' },
  { label: 'Connect', href: '/#connect' },
];
---

<header
  class="fixed left-0 right-0 top-0 z-50 border-b border-ink/5 bg-paper/95 backdrop-blur-sm transition-all duration-300"
>
  <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
    <!-- Logo -->
    <a href="/" class="group flex items-center gap-3">
      <img
        src="/images/svc-logo-black.png"
        alt="SVCC Logo"
        class="h-9 w-9 object-contain"
        width="36"
        height="36"
      />
      <span
        class="font-display text-sm font-semibold uppercase tracking-wide text-ink/70 transition-colors group-hover:text-ink"
      >
        SV College Church
      </span>
    </a>

    <!-- Desktop links -->
    <ul class="hidden items-center gap-8 md:flex">
      {
        navLinks.map((link) => (
          <li>
            <a
              href={link.href}
              class="relative font-sans text-sm font-medium text-ink/60 transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[1.5px] after:w-0 after:bg-accent after:transition-all hover:text-ink hover:after:w-full"
            >
              {link.label}
            </a>
          </li>
        ))
      }
      <li>
        <a
          href="/#visit"
          class="bg-ink px-4 py-2 font-sans text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent"
        >
          Plan a Visit
        </a>
      </li>
    </ul>

    <!-- Mobile menu toggle (CSS-only checkbox trick) -->
    <label
      class="-mr-2 cursor-pointer p-2 md:hidden"
      for="mobile-menu-toggle"
      aria-label="Toggle menu"
    >
      <span class="mb-1.5 block h-px w-5 bg-ink"></span>
      <span class="mb-1.5 block h-px w-5 bg-ink"></span>
      <span class="block h-px w-3 bg-ink"></span>
    </label>
    <input type="checkbox" id="mobile-menu-toggle" class="peer hidden" />

    <!-- Mobile menu panel -->
    <div
      class="fixed inset-x-0 top-16 hidden border-b border-ink/10 bg-paper px-6 py-6 peer-checked:block md:hidden"
    >
      <ul class="flex flex-col gap-5">
        {
          navLinks.map((link) => (
            <li>
              <a href={link.href} class="font-sans text-base font-medium text-ink">
                {link.label}
              </a>
            </li>
          ))
        }
        <li class="pt-2">
          <a
            href="/#visit"
            class="inline-block bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-paper transition-colors hover:bg-accent"
          >
            Plan a Visit
          </a>
        </li>
      </ul>
    </div>
  </nav>
</header>
```

**Commit:**

```bash
git add src/components/Nav.astro
git commit -m "feat: add Nav component with mobile menu"
```

---

## Task 7: Footer component

**Files:**

- Create: `src/components/Footer.astro`

```astro
---
const year = new Date().getFullYear();
---

<footer class="bg-ink text-paper">
  <div class="mx-auto max-w-6xl px-6 py-16">
    <div class="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3">
      <!-- Brand -->
      <div>
        <img
          src="/images/svc-logo-white.png"
          alt="SVCC Logo"
          class="mb-4 h-14 w-14 object-contain invert"
          width="56"
          height="56"
        />
        <p class="font-display text-xl leading-snug text-paper/80">
          Silicon Valley<br />College Church
        </p>
      </div>

      <!-- Quick links -->
      <div>
        <h3 class="mb-4 font-sans text-xs font-semibold uppercase tracking-widest text-paper/40">
          Explore
        </h3>
        <ul class="space-y-2.5">
          {
            [
              ['Visit Us', '/#visit'],
              ['About', '/about'],
              ['Sermons', '/#sermons'],
              ['Get Connected', '/#connect'],
            ].map(([label, href]) => (
              <li>
                <a
                  href={href}
                  class="font-sans text-sm text-paper/60 transition-colors hover:text-paper"
                >
                  {label}
                </a>
              </li>
            ))
          }
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h3 class="mb-4 font-sans text-xs font-semibold uppercase tracking-widest text-paper/40">
          Find Us
        </h3>
        <p class="font-sans text-sm leading-relaxed text-paper/60">
          Silicon Valley, CA<br />
          Sundays at 10:00 AM<br />
          <a
            href="mailto:hello@svcc.church"
            class="mt-2 inline-block text-accent transition-colors hover:text-paper"
          >
            hello@svcc.church
          </a>
        </p>
      </div>
    </div>

    <!-- Bottom bar -->
    <div
      class="flex flex-col items-start justify-between gap-3 border-t border-paper/10 pt-8 md:flex-row md:items-center"
    >
      <p class="font-sans text-xs text-paper/30">
        &copy; {year} Silicon Valley College Church. All rights reserved.
      </p>
      <div class="h-px w-8 bg-accent"></div>
    </div>
  </div>
</footer>
```

**Commit:**

```bash
git add src/components/Footer.astro
git commit -m "feat: add Footer component"
```

---

## Task 8: Homepage — Hero section

**Files:**

- Modify: `src/pages/index.astro` (replace placeholder content entirely)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
---

<BaseLayout
  title="Silicon Valley College Church"
  description="A contemporary Christian church in Silicon Valley for college students and young adults. Join us Sundays at 10am."
>
  <Nav />

  <main>
    <!-- HERO -->
    <section class="relative flex min-h-[92vh] items-center overflow-hidden bg-paper pt-16">
      <!-- Decorative diagonal slashes (echo the logo motif) -->
      <div
        class="bg-ink/8 pointer-events-none absolute right-0 top-0 w-px origin-top"
        style="height: 140%; transform: rotate(8deg) translateX(-20vw);"
        aria-hidden="true"
      >
      </div>
      <div
        class="pointer-events-none absolute right-0 top-0 w-px origin-top bg-accent/20"
        style="height: 140%; transform: rotate(8deg) translateX(-22vw);"
        aria-hidden="true"
      >
      </div>

      <div class="mx-auto w-full max-w-6xl px-6 py-24">
        <div class="max-w-3xl">
          <p
            class="animate-fade-up mb-8 font-sans text-xs font-semibold uppercase tracking-widest text-ink/40"
            style="animation-delay: 0.1s"
          >
            Silicon Valley — Sundays 10 AM
          </p>

          <h1
            class="animate-fade-up mb-8 font-display font-semibold leading-[1.05]"
            style="font-size: clamp(3.5rem, 8vw, 7rem); animation-delay: 0.2s;"
          >
            A church<br />
            for the <span class="italic text-accent">curious.</span>
          </h1>

          <p
            class="animate-fade-up mb-12 max-w-xl font-sans text-lg leading-relaxed text-ink/60"
            style="animation-delay: 0.35s"
          >
            We're a community of college students and young adults asking real questions, exploring
            faith, and finding belonging in Silicon Valley.
          </p>

          <div class="animate-fade-up flex flex-wrap gap-4" style="animation-delay: 0.5s">
            <a
              href="#visit"
              class="bg-ink px-8 py-4 font-sans text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent"
            >
              Plan a Visit
            </a>
            <a
              href="#connect"
              class="border border-ink/20 px-8 py-4 font-sans text-sm font-semibold text-ink transition-all duration-200 hover:border-ink hover:bg-ink hover:text-paper"
            >
              Get Connected
            </a>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div
        class="animate-fade-up absolute bottom-8 left-6 flex items-center gap-3"
        style="animation-delay: 0.8s"
      >
        <div class="h-12 w-px bg-ink/20"></div>
        <span class="font-sans text-xs uppercase tracking-widest text-ink/30">Scroll</span>
      </div>
    </section>
  </main>

  <Footer />
</BaseLayout>

<style>
  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-up {
    animation: fade-up 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
</style>
```

**Verify:** `bun run dev` — check hero renders correctly at http://localhost:4321

**Commit:**

```bash
git add src/pages/index.astro
git commit -m "feat: add homepage with hero section"
```

---

## Task 9: Homepage — remaining sections

**Files:**

- Modify: `src/pages/index.astro` (add sections inside `<main>` after hero, before `<Footer />`)

### Visit Info Strip

```astro
<section id="visit" class="bg-ink py-16 text-paper">
  <div class="mx-auto max-w-6xl px-6">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-paper/10">
      {
        [
          { label: 'When', value: 'Sundays', detail: '10:00 AM' },
          { label: 'Where', value: 'San Jose, CA', detail: 'Address shared upon RSVP' },
          { label: 'Who', value: 'Everyone', detail: 'College students & young adults' },
        ].map((item) => (
          <div class="first:pl-0 last:pr-0 md:px-8" data-animate>
            <p class="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-paper/30">
              {item.label}
            </p>
            <p class="mb-1 font-display text-3xl font-semibold text-paper">{item.value}</p>
            <p class="font-sans text-sm text-paper/50">{item.detail}</p>
          </div>
        ))
      }
    </div>
  </div>
</section>
```

### What to Expect

```astro
<section class="bg-paper py-24">
  <div class="mx-auto max-w-6xl px-6">
    <div class="mb-16" data-animate>
      <p class="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-ink/30">
        First time?
      </p>
      <h2
        class="font-display font-semibold leading-tight text-ink"
        style="font-size: clamp(2.5rem, 5vw, 4.5rem);"
      >
        What to expect
      </h2>
    </div>

    <div class="bg-ink/8 grid grid-cols-1 gap-px md:grid-cols-3">
      {
        [
          {
            num: '01',
            title: 'Genuine welcome',
            body: 'No dress code, no obligation. Show up as you are. Someone will be there to greet you.',
          },
          {
            num: '02',
            title: 'Real teaching',
            body: 'We go through books of the Bible verse by verse. Challenging, honest, and worth your time.',
          },
          {
            num: '03',
            title: 'Community after',
            body: "Stick around. We hang out after service — it's genuinely the best part.",
          },
        ].map((item, i) => (
          <div class="bg-paper p-10" data-animate data-animate-delay={String(i + 1)}>
            <span class="mb-6 block font-display text-5xl font-bold leading-none text-accent/20">
              {item.num}
            </span>
            <h3 class="mb-3 font-display text-2xl font-semibold text-ink">{item.title}</h3>
            <p class="font-sans text-sm leading-relaxed text-ink/55">{item.body}</p>
          </div>
        ))
      }
    </div>
  </div>
</section>
```

### Who We Are

```astro
<section class="relative overflow-hidden bg-ink py-24 text-paper">
  <div
    class="pointer-events-none absolute left-0 top-0 w-px origin-top bg-paper/5"
    style="height: 130%; transform: rotate(6deg) translateX(30vw);"
    aria-hidden="true"
  >
  </div>

  <div class="relative mx-auto max-w-6xl px-6">
    <div class="max-w-2xl" data-animate>
      <p class="mb-4 font-sans text-xs font-semibold uppercase tracking-widest text-paper/30">
        Who we are
      </p>
      <h2
        class="mb-8 font-display font-semibold leading-tight"
        style="font-size: clamp(2rem, 4vw, 3.5rem);"
      >
        We take the Bible seriously.<br />
        We take <span class="italic text-accent">questions</span> seriously too.
      </h2>
      <p class="mb-10 max-w-lg font-sans text-base leading-relaxed text-paper/60">
        SVCC is a non-denominational church rooted in the gospel of Jesus Christ. We believe faith
        grows in community — so we prioritize belonging, honest conversation, and serving our city.
      </p>
      <a
        href="/about"
        class="inline-flex items-center gap-3 font-sans text-sm font-semibold text-paper transition-colors hover:text-accent"
      >
        Read our story
        <span class="inline-block h-px w-8 bg-current"></span>
      </a>
    </div>
  </div>
</section>
```

### Get Connected

```astro
<section id="connect" class="bg-paper py-24">
  <div class="mx-auto max-w-6xl px-6">
    <div class="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
      <div data-animate>
        <p class="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-ink/30">
          Next steps
        </p>
        <h2
          class="mb-6 font-display font-semibold leading-tight"
          style="font-size: clamp(2.5rem, 5vw, 4rem);"
        >
          Ready to<br /><span class="italic text-accent">visit us?</span>
        </h2>
        <p class="max-w-sm font-sans text-sm leading-relaxed text-ink/55">
          Fill out a quick form and we'll send you everything you need to know — address, parking,
          and what to expect — before you arrive.
        </p>
      </div>

      <div data-animate data-animate-delay="2">
        <form class="space-y-4" name="connect" method="POST" action="/thanks">
          <div>
            <label
              for="name"
              class="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wide text-ink/40"
              >Your name</label
            >
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="First name"
              class="w-full border border-ink/15 bg-transparent px-4 py-3 font-sans text-sm text-ink transition-colors placeholder:text-ink/25 focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label
              for="email"
              class="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wide text-ink/40"
              >Email</label
            >
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full border border-ink/15 bg-transparent px-4 py-3 font-sans text-sm text-ink transition-colors placeholder:text-ink/25 focus:border-ink focus:outline-none"
            />
          </div>
          <button
            type="submit"
            class="mt-2 w-full bg-ink py-4 font-sans text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent"
          >
            Send me the details
          </button>
        </form>
      </div>
    </div>
  </div>
</section>
```

**Verify:** Scroll through all sections in dev server. Check `data-animate` elements fade in.

**Commit:**

```bash
git add src/pages/index.astro
git commit -m "feat: add homepage sections — visit info, what to expect, who we are, connect form"
```

---

## Task 10: About page

**Files:**

- Create: `src/pages/about.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
---

<BaseLayout
  title="About"
  description="Learn about Silicon Valley College Church — our story, what we believe, and our community."
>
  <Nav />

  <main class="pt-16">
    <!-- PAGE HERO -->
    <section class="border-ink/8 border-b bg-paper py-24">
      <div class="mx-auto max-w-6xl px-6">
        <p
          class="animate-fade-up mb-4 font-sans text-xs font-semibold uppercase tracking-widest text-ink/30"
          style="animation-delay: 0.1s"
        >
          About SVCC
        </p>
        <h1
          class="animate-fade-up font-display font-semibold leading-tight"
          style="font-size: clamp(3rem, 7vw, 6rem); animation-delay: 0.2s;"
        >
          Not your<br />average <span class="italic text-accent">church.</span>
        </h1>
      </div>
    </section>

    <!-- OUR STORY -->
    <section class="bg-paper py-24">
      <div class="mx-auto max-w-6xl px-6">
        <div class="grid grid-cols-1 gap-16 md:grid-cols-2">
          <div data-animate>
            <h2 class="mb-6 font-display text-4xl font-semibold leading-tight">Our story</h2>
            <div class="space-y-4 font-sans text-sm leading-relaxed text-ink/60">
              <p>
                Silicon Valley College Church was planted to serve the thousands of students and
                young professionals who call the Bay Area home — people who are smart, driven, and
                often spiritually curious but haven't found a church that takes both their intellect
                and their questions seriously.
              </p>
              <p>
                We believe the gospel of Jesus Christ is good news worth sharing, and that the local
                church is one of the most powerful forces for human flourishing in the world.
              </p>
            </div>
          </div>
          <div data-animate data-animate-delay="2">
            <div class="border-l-2 border-accent py-2 pl-8">
              <blockquote class="font-display text-2xl font-semibold leading-snug text-ink">
                "Come and see."
              </blockquote>
              <cite
                class="mt-3 block font-sans text-xs uppercase not-italic tracking-wide text-ink/40"
              >
                John 1:39
              </cite>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHAT WE BELIEVE -->
    <section class="bg-ink py-24 text-paper">
      <div class="mx-auto max-w-6xl px-6">
        <div class="mb-16" data-animate>
          <p class="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-paper/30">
            Doctrine
          </p>
          <h2
            class="font-display font-semibold leading-tight"
            style="font-size: clamp(2.5rem, 5vw, 4rem);"
          >
            What we believe
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-px bg-paper/10 md:grid-cols-2">
          {
            [
              {
                title: 'The Bible',
                body: 'We believe the Bible is the inspired, authoritative Word of God — our ultimate guide for faith and life.',
              },
              {
                title: 'Jesus Christ',
                body: 'We believe Jesus is fully God and fully human, who died for our sins and rose bodily from the dead.',
              },
              {
                title: 'Salvation by grace',
                body: 'We are saved by grace alone through faith alone in Christ alone — not by our own effort or merit.',
              },
              {
                title: 'The local church',
                body: "We believe the local church is central to God's plan — a community of disciples on mission together.",
              },
            ].map((item, i) => (
              <div class="bg-ink p-10" data-animate data-animate-delay={String((i % 2) + 1)}>
                <h3 class="mb-3 font-display text-2xl font-semibold text-paper">{item.title}</h3>
                <div class="mb-4 h-px w-8 bg-accent" />
                <p class="font-sans text-sm leading-relaxed text-paper/55">{item.body}</p>
              </div>
            ))
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-paper py-24">
      <div class="mx-auto max-w-6xl px-6 text-center" data-animate>
        <h2 class="mb-6 font-display font-semibold" style="font-size: clamp(2rem, 4vw, 3.5rem);">
          Come check us out.
        </h2>
        <p class="mx-auto mb-10 max-w-md font-sans text-sm leading-relaxed text-ink/55">
          No pressure, no commitment. Just a Sunday morning with people who are glad you came.
        </p>
        <a
          href="/#connect"
          class="inline-block bg-ink px-10 py-4 font-sans text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent"
        >
          Plan a Visit
        </a>
      </div>
    </section>
  </main>

  <Footer />
</BaseLayout>

<style>
  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-up {
    animation: fade-up 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
</style>
```

**Commit:**

```bash
git add src/pages/about.astro
git commit -m "feat: add About page with story, beliefs, and CTA"
```

---

## Task 11: Production build verification

**Step 1:**

```bash
bun run build
```

Expected: exits 0, `dist/` created.

**Step 2: Check critical outputs**

```bash
ls dist/
ls dist/about/
cat dist/robots.txt
ls dist/sitemap*
```

Expected: `index.html`, `about/index.html`, `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml`

**Step 3:**

```bash
bun run astro check
```

Expected: 0 TypeScript errors

**Step 4:**

```bash
bun run format:check
```

Expected: no formatting issues (run `bun run format` first if needed)

**Step 5: Commit if any format fixes were needed**

```bash
git add -A
git commit -m "chore: production build verified, formatting clean"
```

---

## Task 12: Replace README.md

**Files:**

- Modify: `README.md` (replace the create-astro default)

Write a comprehensive README covering:

- Project name + one-line description (SVCC website)
- Tech stack (Astro, Bun, TypeScript, Tailwind CSS v3, @astrojs/sitemap)
- Prerequisites: Bun (https://bun.sh), Node 18+
- Local setup: `git clone`, then `bun install`
- Development: `bun run dev` → http://localhost:4321
- Build: `bun run build` → outputs to `dist/`
- Preview: `bun run preview`
- Formatting: `bun run format` / `bun run format:check`
- Project structure (annotated file tree covering src/layouts, src/components, src/pages, src/styles, public/)
- Deployment: static host (Netlify, Vercel, Cloudflare Pages) — just point at `dist/`
- Site URL: update `site` in `astro.config.mjs` before deploying

**Commit:**

```bash
git add README.md
git commit -m "docs: add comprehensive README with Bun setup and deployment instructions"
```

---

## Final Checklist

- [ ] `bun run build` exits 0
- [ ] `dist/sitemap-index.xml` exists
- [ ] `dist/robots.txt` exists
- [ ] Both pages render correctly (homepage + about)
- [ ] Scroll animations fire on both pages
- [ ] Hero fade-up animations on both pages
- [ ] Mobile nav works (CSS-only)
- [ ] `bun run astro check` — 0 errors
- [ ] `bun run format:check` — passes
