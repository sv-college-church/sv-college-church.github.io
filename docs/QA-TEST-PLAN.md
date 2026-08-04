# QA Test Plan — Silicon Valley College Church Website

**Stack:** Astro 5.17.1 (static output) · TypeScript strict · Tailwind CSS v3 · @astrojs/sitemap · @astrojs/tailwind · deployed via GitHub Actions to GitHub Pages, canonical domain `https://svcollegechurch.org`

**Scope:** All 12 built routes — `/`, `/about`, `/connect`, `/gather`, `/campuses`, `/campuses/sjsu`, `/campuses/stanford`, `/campuses/scu`, `/campuses/ucsc`, `/campuses/deanza`, `/class-of-2030`, `/404` — plus shared components `Nav.astro`, `Footer.astro`, `EventBanner.astro`, `UpcomingEvents.astro`, and layout `BaseLayout.astro`.

This plan was written after reading the actual source (`src/pages`, `src/components`, `src/layouts`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `public/`, `.github/workflows/*`) and running `npx astro check` and `npm run build` against the repo. Items in **Section 0** are confirmed, reproducible findings, not hypothetical risks — fix or triage these first.

---

## 0. Confirmed Findings From This Pass (fix/triage first)

- [ ] `npx astro check` currently reports **9 real TypeScript errors**, all in `src/pages/about.astro`'s accordion `<script>` (lines ~547–561): `item`, `content`, and `el.querySelector(...)` results are used without null checks (`ts(18047)`, `ts(2339)`, `ts(2531)`). `.github/workflows/ci.yml` sets `continue-on-error: true` on the type-check step with the comment "advisory until pre-existing errors in about.astro and church.astro are fixed" — `church.astro` no longer exists (renamed to `gather.astro`?), and the `about.astro` errors are still present. Decide whether to fix the null-guards or keep the check advisory intentionally.
- [ ] `BaseLayout.astro` imports `ViewTransitions` from `astro:transitions` — `astro check` flags this as **deprecated** (Astro 5 renamed it `ClientRouter`). Confirm whether to migrate before it's removed in a future Astro major version.
- [ ] `BaseLayout.astro`'s inline JSON-LD `<script type="application/ld+json" set:html={...}>` triggers an Astro hint that it's being treated as `is:inline` implicitly — add the directive explicitly to silence it and confirm no processing is expected.
- [ ] Both seed events in `src/content/events/` are **already in the past** relative to any date after mid-May 2026: `does-science-disprove-god.md` (date 2026-04-22, endDate 2026-04-22) and `senior-sunday.md` (date 2026-05-17). `getUpcomingEvents()` in `src/lib/events.ts` correctly filters these out once expired, so the banner/upcoming-events UI will silently go empty — but this is stale placeholder/demo content that must be replaced with real events before this ships, and it means `/gather`'s "Coming Up" section and the homepage-adjacent banner currently have **no real content to test against**. Add a live/future-dated event fixture before doing visual QA on `EventBanner.astro` and `UpcomingEvents.astro`.
- [ ] No `CNAME` file exists anywhere in the repo (checked `public/` and repo root), yet `astro.config.mjs` sets `site: 'https://svcollegechurch.org'` and `.github/workflows/deploy.yml` deploys to GitHub Pages. Unless the custom domain is configured via repo Settings (not in source), sitemap URLs, canonical tags, and OG/Twitter image URLs (all built from `Astro.site`) will point to a domain the deployed site isn't actually served from. Verify DNS + GitHub Pages custom-domain config out-of-band.
- [ ] Two lockfiles are committed: `bun.lock` and `package-lock.json`. `README.md` instructs contributors to use Bun; all three GitHub Actions workflows (`ci.yml`, `deploy.yml`, `audit.yml`) run `npm ci`. Confirm which package manager is canonical and remove the stale lockfile to prevent dependency drift between local dev and CI.
- [ ] `README.md`'s file tree references `public/favicon.svg`, but the actual file is `public/favicon.png` (referenced correctly in `BaseLayout.astro` as `/favicon.png`). Minor doc/reality mismatch.
- [ ] `src/assets/images/` contains four unused source photos totaling **~25 MB** (`church-beach.jpg` 9.6 MB, `church-easter.jpg` 9.5 MB, `church-cliff.jpg` 3.5 MB, `church-train.jpg` 2.7 MB) — confirmed via `grep` that none are imported anywhere in `src/`. They aren't shipped to `dist/` (Astro only emits referenced assets) but are dead weight in the repo/git history.
- [ ] `public/images/campuses/*.jpg` (`scu-klesis.jpg` 948 KB, `sjsu-klesis.jpg` 924 KB, `stanford-moment-intl.jpg` 792 KB, `sjsu-4c.jpg` 736 KB, `stanford-moment.jpg`, `ucsc-klesis.jpg`) are **not referenced anywhere** in `src/` (the campus pages use the optimized `src/assets/images/campuses/logos/*.png` via `astro:assets` `<Image>` instead). Because they live in `public/`, Astro copies them into `dist/` verbatim regardless of use — confirmed via `npm run build`: **3.7 MB of unused, unoptimized JPGs ship to production** at `/images/campuses/*.jpg`. Either wire them up or delete them.
- [ ] `npm run build` completes cleanly (12 pages, sitemap generated, ~22 MB `dist/`). `sitemap-index.xml` correctly lists all 11 real routes and correctly excludes `/404`.
- [ ] Color-contrast check (WCAG formula, computed against the design system in `tailwind.config.mjs` / `docs/design.md`): `accent` (`#D91C2A`) on `paper` (`#F5F5F0`) is **4.63:1** — passes AA for normal text but fails AAA. `.where-footnote` in `gather.astro` (`color: rgb(10 10 10 / 0.55)`, `font-size: 0.72rem`, not large text) computes to **~4.30:1**, which **fails WCAG AA's 4.5:1 minimum for normal-size text**. The `.info-col .section-label` "WHEN"/"WHERE" labels at `ink/50` (**3.65:1**) pass only because they qualify as large/bold text (≥3:1 threshold) — verify this holds at the smallest end of their `clamp()` range on narrow viewports.
- [ ] No `prefers-reduced-motion` media query exists anywhere in the codebase (`global.css`, or any page's inline `<style>`). The site has a large number of non-essential animations: homepage polaroid drop/fan/breathe sequence, `Nav.astro` logo 3D tilt + emoji pop-ins, `about.astro` word-by-word hero reveal + accordion, `class-of-2030.astro` sparkle-trail canvas + 10 drifting bokeh orbs + scrolling photo banner, badge pulse/breathe rings on `index.astro`/`campuses/index.astro`. None are gated behind `@media (prefers-reduced-motion: reduce)`.

---

## 1. Functional Testing

### 1.1 Primary navigation (`Nav.astro`)
- [ ] Desktop nav shows all 4 links (Gather, Campuses, Connect, About) plus centered logo at ≥768px.
- [ ] Each nav link (`#church-link`/Gather, `#campuses-link`, `#connect-link`, `#about-link`) navigates to the correct route: `/gather`, `/campuses`, `/connect`, `/about`.
- [ ] Hovering each desktop link triggers its emoji pop-in (🙏 Gather, 🌲🐌🛡️ Campuses ×3, 🤝 Connect, 📖 About) only on `(hover: hover) and (pointer: fine)` devices; confirm it does **not** fire on touch devices per the `matchMedia` guard.
- [ ] Clicking a nav link with an emoji triggers the "burst" animation and delays navigation by ~450ms (`setTimeout` in `setupSingleEmoji`) — confirm the delayed navigation actually completes and isn't dropped if the user double-clicks or navigates away mid-animation.
- [ ] Logo (`#logo-link`) links to `/` from every page, including from campus sub-pages and `/class-of-2030`.
- [ ] Logo 3D tilt-on-mousemove effect activates only for `(hover: hover) and (pointer: fine)`; resets smoothly (`is-resetting` class, 720ms timeout) on mouse-leave without jitter.
- [ ] Mobile hamburger (`#menu-toggle`) toggles `aria-expanded` between `"false"`/`"true"` and animates the 3-bar icon into an X.
- [ ] Tapping the hamburger opens `#mobile-menu` (measured via `scrollHeight`, animated via `max-height`) and reveals Gather/Campuses/Connect/About stacked links.
- [ ] Tapping hamburger again collapses the mobile menu back to `max-height: 0`.
- [ ] Each mobile menu link navigates correctly and the menu state resets (closed) after navigating to a new page (verify via the `astro:page-load` re-init logic, since View Transitions persist DOM across navigations).
- [ ] Nav bar is `fixed` and remains pinned while scrolling on every page with scrollable content (`about.astro`, `campuses/*.astro`).
- [ ] Nav visually adapts on campus sub-pages: confirm the global style overrides in e.g. `campuses/sjsu.astro` (`header a { color: rgba(255,255,255,0.75) }`, dark blue backdrop, gold hover) apply correctly and **do not leak** onto other pages when navigating away via client-side View Transitions (test: sjsu → stanford → home → about in sequence, watching for a flash of the wrong nav color on each transition).
- [ ] `/class-of-2030`'s dark-mode nav override (`body:has(#c30-main) .nav-header::before`) applies only on that page and reverts correctly when leaving it.

### 1.2 Footer (`Footer.astro`)
- [ ] Copyright year renders as the current year (`new Date().getFullYear()`) — will read 2026 as of today; confirm this is computed at **build time** (static site), meaning the year will go stale until the next rebuild after Jan 1 — check the daily cron rebuild in `deploy.yml` covers this rollover.
- [ ] All 3 network logos (Acts2 Network, Acts2 College, Send Network) link out to the correct external URLs and open in a new tab.
- [ ] Instagram icon links to `https://www.instagram.com/sv.collegechurch` and Spotify icon to the correct show URL; both open in new tabs.
- [ ] Footer renders identically (aside from the color-theme overrides) on every page it appears on.
- [ ] On `index.astro`, the footer starts at `opacity: 0` and only becomes visible (`is-visible` class) after the ~3.2s hero sequence completes — confirm this doesn't leave the footer permanently hidden if the sequence JS throws/bails early (e.g., `cards.length === 0`).

### 1.3 Event banner (`EventBanner.astro`) and upcoming events (`UpcomingEvents.astro`)
- [ ] With an active `tier: "banner"` event whose `bannerStartsAt`/default 21-day lead window includes today: confirm the fixed banner renders above the nav, `--banner-height` CSS var is set, and `.nav-header` top offset shifts down to clear it.
- [ ] Banner's full label (`.label-full`) shows above 640px, short label (`.label-short`) shows at ≤640px — verify the breakpoint switch with real content (currently untestable — see Section 0 stale-events finding).
- [ ] Banner CTA link (`banner.cta.url`) navigates correctly (e.g., to `/gather#upcoming-events`).
- [ ] With **no** active banner event (the current real state), confirm no banner renders, `--banner-height` stays `0px`, and nav sits flush at `top: 0`.
- [ ] `UpcomingEvents.astro` renders one card per event returned by `getHighlightedEvents()` (tier `banner` or `featured`); confirm date formatting (`fmtMonth`/`fmtDay`/`fmtWeekday`, all forced to `timeZone: 'UTC'`) doesn't shift the displayed date by one day for users in US Pacific time viewing an event dated e.g. `2026-04-22` (a classic UTC-parsed-date-off-by-one bug — verify explicitly).
- [ ] Single-event layout (`.is-single` modifier) renders centered/narrower; multi-event layout uses the `auto-fit` grid — test with 1, 2, and 3+ events.
- [ ] `#upcoming-events` anchor scroll target respects `scroll-margin-top` accounting for `--banner-height` so the section isn't hidden under the fixed nav/banner when jumped to via the "Coming Up" trigger on `/gather`.

### 1.4 Homepage (`index.astro`) interactive sequence
- [ ] On load, 4 polaroid cards drop in sequentially (staggered `setTimeout`), shuffle to a random 4-of-23 community photos each page load (Fisher-Yates `shuffle()`).
- [ ] Hero text ("Welcome to / Silicon Valley College Church") reveals word-by-word on the documented timeline (0.7s shrink, 1.5s/1.8s/2.2s text reveal, 2.6s settle, 3.2s badge pop).
- [ ] Desktop: hovering the polaroid stack fans the 4 cards horizontally (`FAN_X` offsets); un-hovering (with the 80ms leave delay) returns them to their randomized stack position.
- [ ] Mobile/touch: swiping the top card past the 80px threshold cycles it to the back of the stack with a fling-off animation; swiping under threshold snaps back.
- [ ] Vertical scroll gestures on the polaroid stack are **not** hijacked by the touch handlers (`touchmove` only calls `preventDefault()` when `|dx| > |dy|`) — confirm page can still be scrolled normally by touch on mobile.
- [ ] "Class of 2030" badge (bottom-right) pops in at ~3.2s, begins a breathing pulse animation, and links to `/class-of-2030`.
- [ ] Re-visiting the homepage via client-side View Transition (e.g., navigating home from `/about`) correctly **resets and replays** the entire intro sequence rather than showing stale/leftover DOM state — the script explicitly resets several properties for this; verify all of them (scale transform, stack position, breathing/fanned classes, badge classes, footer visibility, hero-word visibility) actually reset in practice.
- [ ] Confirm no horizontal scrollbar appears from the fan animation's wide `FAN_X` offsets (±900px) — page relies on `overflow-x: clip` on `html`.

### 1.5 About page (`about.astro`)
- [ ] Hero words ("Launching kingdom workers from every college town.") reveal in staggered sequence on load.
- [ ] "↓" scroll hint anchor-links to `#story` and scrolls smoothly (`scroll-behavior: smooth` from `global.css`).
- [ ] Each `data-animate` section (Our Story, Leadership, The Team, Statement of Faith, Resources) fades up into view via `IntersectionObserver` as the user scrolls, and does **not** replay every time it re-enters the viewport (observer calls `unobserve` after first trigger — verify).
- [ ] Statement of Faith accordion: only one of the 9 belief items (`The Bible`, `The Godhead`, `God the Father`, `God the Son`, `God the Holy Spirit`, `Man`, `Salvation`, `The Church`, `The Christian Life`) can be open at a time; opening a new one closes the previously open one.
- [ ] Accordion `aria-expanded` attribute toggles correctly per item and the `+` icon rotates 45° when open.
- [ ] All 7 external resource/network links (Course 101, Daily Devotions, Bible Resources, Apologetics, Acts2 Network, Acts2 College, Send Network) open in new tabs and point to live, correct URLs.
- [ ] Both `<Image>` components (`suhfam.png` — Steve & Suzanne family photo, `mentors.png` — staff group photo) render at the correct `aspect-ratio: 3/2` crop without obvious distortion.
- [ ] Re-confirm the 9 `astro check` TypeScript errors here don't correspond to an actual runtime bug — click through every accordion item manually to verify no console errors even though the types are unsafe (JS is loosely typed at runtime, so the null-safety issues may or may not manifest as real bugs — test explicitly).

### 1.6 Connect page (`connect.astro`)
- [ ] Google Form iframe (`connect-form`) loads and displays the embedded form.
- [ ] Skeleton loader (6 fake card placeholders with shimmer animation) displays first and hides (`skeleton-hidden` class) only after the iframe's `load` event fires.
- [ ] If the Google Form URL is unreachable/blocked (e.g., corporate network, ad blocker, or Google Forms outage), confirm the skeleton doesn't hang indefinitely — currently there is **no timeout/fallback**, so a failed iframe load leaves the skeleton showing forever with no error message. Test with network throttling/blocking.
- [ ] Confirm the iframe's fixed `height="1547"` doesn't create excess empty space or clip content if Google changes the form's rendered height (add a new question, etc.) — no responsive iframe-resizing logic exists.
- [ ] `page-enter` fade/slide-in animation plays once per page load without re-triggering on scroll.

### 1.7 Gather page (`gather.astro`)
- [ ] "When" (Sundays / 12 PM) and "Where" (SVC Student Center, 2346 Walsh Ave, Santa Clara) render correctly side-by-side on desktop and stacked on mobile (≤640px breakpoint).
- [ ] "Get Directions →" link opens the correct Google Maps URL in a new tab.
- [ ] Footnote "* we also gather at other spots across the South Bay" is present and legible (see Section 0 contrast finding).
- [ ] "Coming Up ↓" trigger only renders when `getHighlightedEvents()` returns at least one event (`hasUpcoming` check) — confirm it's correctly **absent** in the current no-upcoming-events state, and reappears once a live event is added.
- [ ] Clicking "Coming Up" scrolls smoothly to `#upcoming-events` and lands below the fixed nav/banner, not underneath it.

### 1.8 Campuses index (`campuses/index.astro`)
- [ ] All 5 campus links (SJSU, Stanford, UC Santa Cruz, SCU, De Anza) navigate to their respective `/campuses/*` routes.
- [ ] Desktop hover-to-dim effect (`.campus-list:hover .campus-name { opacity: 0.15 }`, individual hover restores to `1`) works only on `hover:hover` devices.
- [ ] `view-transition-name: campus-{slug}` on each link and on the corresponding hero section on the destination page — verify the shared-element View Transition animates smoothly between the campus list and each campus detail page (and reverse, via the "← Campuses" back link) in supporting browsers, and degrades gracefully (instant navigation, no error) in browsers without View Transitions support.
- [ ] Class of 2030 badge repeats here identically to the homepage — confirm it links correctly and its position doesn't overlap the campus list on short viewports.

### 1.9 Individual campus pages (`sjsu.astro`, `stanford.astro`, `scu.astro`, `ucsc.astro`, `deanza.astro`)
- [ ] Each page's "← Campuses" back link returns to `/campuses`.
- [ ] Each page's ministry-group Instagram link(s) open correctly in new tabs: SJSU → `klesis_sjsu` and `4corners_sjsu`; confirm the equivalent links on Stanford (Moment/Moment Intl), SCU (Klesis SCU), UCSC (Klesis UCSC), and De Anza (ISMP) are present, correct, and not broken/placeholder URLs.
- [ ] Each page's distinct color theme (SJSU navy/gold `#003874`/`#E5A823`, and whatever theme Stanford/SCU/UCSC/De Anza use) renders fully — header, footer, links, hamburger bars, logo filter — with no unstyled/default (`ink`/`paper`) elements leaking through.
- [ ] Two-column (or single-column, for pages with only one ministry group) layout collapses correctly to a single stacked column at ≤640px.
- [ ] Content is accurate and not a placeholder for each ministry group's description text (spot-check against ministry's actual current name/status — e.g., confirm "4Corners" and "Klesis" groups are still active/correctly named as of today's date).

### 1.10 Class of 2030 page (`class-of-2030.astro`)
- [ ] Autoplay muted looping video (`svc-welcome-2030.mp4`, 15 MB) plays automatically on load with the poster (`svc-welcome-2030-cover.jpg`) as fallback if autoplay is blocked.
- [ ] Mute/unmute button toggles `vid.muted`, updates its `aria-label` ("Unmute video" ↔ "Mute video"), and visually shrinks from a large centered button to a small corner button once unmuted (`is-unmuted` class).
- [ ] Skip-back/skip-forward (±5s) buttons adjust `vid.currentTime` correctly and are clamped to `[0, duration]`.
- [ ] Fullscreen button (mobile-only, `display: none` above 768px) correctly calls `webkitEnterFullscreen()` on iOS Safari and `requestFullscreen()`/`webkitRequestFullscreen()` elsewhere.
- [ ] Cursor/touch sparkle-trail canvas renders correctly, resizes via `ResizeObserver` on layout shifts, and is torn down (`cancelAnimationFrame`, listeners removed) on `astro:before-swap` when navigating away — verify no memory leak / orphaned RAF loop after repeated navigation in and out of this page.
- [ ] Both CTAs ("Get Connected" → `/connect`, "More Info" → `/about`) navigate correctly.
- [ ] Scrolling photo banner (12 community photos, duplicated for seamless loop, `50s linear infinite`) loops without a visible seam/jump.
- [ ] Confirm the video's `poster` image and `<source>` both resolve (no 404) and that the video plays audio correctly once unmuted (test actual audio track presence).

### 1.11 404 page (`404.astro`)
- [ ] Navigating to any non-existent route serves this custom 404 (verify on the actual static host — GitHub Pages requires `404.html` at the site root, which `astro build` produces at `dist/404.html`; confirm the host is configured to serve it for unmatched paths).
- [ ] Wandering sheep emoji animates continuously via `requestAnimationFrame`, bounces off all 4 edges of its container.
- [ ] Clicking the sheep makes it "flee" in the opposite direction at increased speed, then decelerates back to base speed.
- [ ] "Back to the Flock" link returns to `/`.
- [ ] Confirm the sheep's RAF loop doesn't keep running/consuming CPU indefinitely if the tab is backgrounded (no `visibilitychange` pause logic currently exists) — check battery/CPU impact on a long-idle 404 tab.

---

## 2. Responsive / Cross-Device Testing

- [ ] Test at minimum: 320px (small mobile), 375px (iPhone SE/mini), 390–430px (modern iPhone), 768px (iPad portrait / Nav's `md:` breakpoint), 1024px (iPad landscape), 1280px, 1440px, 1920px (desktop), and an ultra-wide (2560px+).
- [ ] Nav switches from mobile hamburger to full desktop link row exactly at the Tailwind `md:` breakpoint (768px) — verify no dead zone where neither layout looks right.
- [ ] Nav height reduction for short viewports (`@media (min-width: 768px) and (max-height: 760px)`, e.g. Windows at 150% scaling / 1280×720) — verify on an actual short-viewport Windows machine or an equivalent emulated viewport, not just macOS (the CSS comment explicitly calls out this is a Windows-scaling fix Mac users won't naturally hit).
- [ ] Homepage polaroid card width (`clamp(240px, 46vw, 580px)` desktop / `clamp(220px, 78vw, 380px)` mobile) — verify cards never overflow the viewport or overlap the hero text at any width in the tested range.
- [ ] About page hero (`min-height: 75vh` desktop, `55vh` at ≤640px) and each `reveal-section` (`min-height: 85vh`) — verify no excessive empty space or content clipping on very short mobile viewports (e.g., landscape phone).
- [ ] Gather page `.when-where` grid: 2-column desktop → 1-column stacked at ≤640px — verify the divider line also switches from vertical to horizontal correctly.
- [ ] Campus pages `.groups-section` grid: 2-column → 1-column at ≤640px (single-group pages like SCU/UCSC/De Anza should never show a stray empty divider column).
- [ ] Class of 2030 hero: verify the WELCOME-orbit SVG text, video, and CTAs all reflow correctly at the documented breakpoints (768px, 480px) without text overlapping the video or CTAs overflowing horizontally.
- [ ] Test both portrait and landscape orientation on phone and tablet for every page, especially `class-of-2030.astro` (100svh-based layout) and `index.astro` (100svh, no-scroll-intended layout).
- [ ] Verify `100svh`/`100vh` usage (`index.astro` body, `campuses/index.astro` body, `class-of-2030.astro` hero) renders correctly on mobile Safari where the address bar show/hide changes viewport height — confirm no content jump or clipped badge/CTA when the browser chrome collapses on scroll.
- [ ] Touch-target size check: nav links, hamburger button, mute/fullscreen/skip buttons on the video, accordion triggers, and footer icons all meet a ~44×44px minimum tap target on mobile.
- [ ] Test with iOS "Larger Text" / Android font-scale accessibility settings at 150–200% — verify layouts (especially the tightly-choreographed homepage hero and Class of 2030 title) don't visually break.
- [ ] Verify all pages at common tablet sizes in **both** orientations, since several layouts (`campuses/index.astro`'s badge absolute positioning, `about.astro`'s `.reveal-section`) are viewport-height-dependent.

---

## 3. Cross-Browser Testing

- [ ] **Chrome** (latest, desktop + Android) — baseline; confirm all animations, `IntersectionObserver` reveals, and the Class of 2030 canvas sparkle trail work.
- [ ] **Safari** (latest, macOS) — pay special attention to: `backdrop-filter` on `.nav-header::before` (confirm blur renders, not just the fallback solid color), CSS `:has()` selector usage (`body:has(#c30-main)` in `class-of-2030.astro` — Safari 15.4+ required, verify actual deployed-browser support target), and `astro:transitions`/View Transitions API support (Safari's support for the View Transitions API is newer/partial vs. Chrome — verify graceful non-animated fallback, not a broken navigation).
- [ ] **Mobile Safari (iOS)** — video autoplay/muted/inline behavior on `class-of-2030.astro` (iOS has historically strict autoplay policies; `playsinline` is present, verify it actually prevents forced fullscreen takeover on play), `webkitEnterFullscreen` fullscreen button behavior, touch-swipe on the homepage polaroid stack, and the mobile menu `max-height` transition.
- [ ] **Firefox** (latest, desktop) — verify `backdrop-filter`, CSS `subgrid` (used in `gather.astro`'s `.info-col { grid-template-rows: subgrid }` and `.when-where`), and `:has()` support (Firefox added `:has()` relatively recently — confirm the minimum supported Firefox version renders the Class of 2030 nav-inversion correctly, and doesn't just silently fail to apply the dark-nav override).
- [ ] **Mobile Chrome (Android)** — touch interactions on homepage polaroid swipe-to-cycle, mobile nav menu, video fullscreen via standard `requestFullscreen()`.
- [ ] Verify Google Fonts (`Cormorant Garamond`, `Instrument Sans`, `Unbounded` from `global.css`; `Bebas Neue`, `Plus Jakarta Sans` loaded separately inside `class-of-2030.astro`'s scoped `<style>`) load and render consistently across all tested browsers, with a sane fallback (`Georgia`, `system-ui`, `sans-serif`, `Impact`) if the Google Fonts CDN is blocked or slow.
- [ ] Verify the `<link rel="preconnect">` hints to `fonts.googleapis.com`/`fonts.gstatic.com` in `BaseLayout.astro` actually correspond to where fonts are loaded from (note: fonts are loaded via `@import` in `global.css` and via a second `@import` inside `class-of-2030.astro`'s own `<style>` block — a `@import` inside a component-scoped style tag is a second, page-specific font request not covered by the layout-level preconnect timing benefits as cleanly as a single shared load).
- [ ] Confirm no vendor-prefix-only CSS features are silently broken on any tested browser — check `-webkit-backdrop-filter`, `-webkit-mask-image`/`mask-composite` fallback pairing in `class-of-2030.astro`'s `.c30-photo-banner` mask (Chromium wants `-webkit-mask-composite: source-in`, standard wants `mask-composite: intersect` — these are **not equivalent keyword sets** across implementations; verify the masked edge-fade actually renders correctly rather than showing a hard-cut or fully-masked-out banner in at least one engine).

---

## 4. Accessibility (a11y)

*Note: `.github/workflows/audit.yml` already runs axe-core (`@axe-core/playwright`) against every built page on every push/PR. Use this section to go beyond what an automated axe scan catches.*

- [ ] Run the existing `audit.yml` accessibility job locally against all 12 routes and confirm 0 violations before merging any change — check it's actually green on `main`, not just configured.
- [ ] Confirm there is **no skip-to-main-content link** anywhere in `BaseLayout.astro` — add one so keyboard users don't have to tab through the entire nav (4–5 links plus emoji spans) on every single page load.
- [ ] Heading hierarchy audit: `about.astro` and `gather.astro` use styled `<p class="section-label">` (e.g., "Our Story", "Leadership", "The Team", "Statement of Faith", "Resources", "When", "Where") instead of real `<h2>`/`<h3>` elements for what are visually section headers. Screen-reader users navigating by heading will skip these entirely. Audit every page for a correct, non-skipping `h1 → h2 → h3` structure using an actual heading-list extension, not just visual inspection.
- [ ] Confirm exactly one `<h1>` per page (spot-checked in source: `index.astro` "Welcome to Silicon Valley College Church", `about.astro` "Launching kingdom workers...", `gather.astro` "SVC Sundays", `connect.astro` "Connect", `campuses/index.astro` "Campuses", each campus page's school name, `class-of-2030.astro` "Class of 2030", `404.astro` "Looks like this page wandered off").
- [ ] All decorative emoji/icon spans (`aria-hidden="true"` on the nav emoji spans, badge ring letters, sheep, bokeh orbs, noise texture, sparkle canvas) are confirmed properly hidden from assistive tech — verify none of them are still exposed in the accessibility tree via browser dev tools.
- [ ] Verify every meaningful `<img>`/`<Image>` has correct, non-redundant alt text: `Nav.astro` logo `alt="SVC"` (fine); homepage polaroid images use generic `alt="SVC community"` on all 4 — acceptable for decorative rotating photos but confirm this is intentional, not an oversight; `about.astro`'s `suhfam.png` (`alt="SVC directors Steve and Suzanne with their family"`) and `mentors.png` (`alt="SVC staff group photo"`) are descriptive — good; campus logo images (`alt="Klesis SJSU"`, `alt="4Corners"`, etc.) — confirm each campus page's logo alt text matches what's actually rendered.
- [ ] Footer network-logo links have `aria-label` (Acts2 Network/College, Send Network) — confirm labels are read correctly by a screen reader given the images inside also carry `alt` text (check for redundant double-announcement).
- [ ] `EventBanner.astro`'s `.label-full`/`.label-short` pair (both rendered, one hidden via CSS at different breakpoints) — confirm a screen reader doesn't announce **both** versions of the banner text back-to-back (CSS `display:none` should exclude the hidden one from the accessibility tree, but verify with an actual screen reader, not just assumption).
- [ ] Full keyboard-only pass on every page: Tab through nav (logo, Gather, Campuses, Connect, About, hamburger where visible), confirm visible focus indicators exist on every interactive element (links, hamburger button, accordion triggers, video control buttons, mute/fullscreen/skip buttons, form iframe). Note: several custom interactive elements (accordion trigger `<button>`s, video control buttons) rely on default browser focus rings — verify none are suppressed by a global `outline: none` anywhere in the CSS.
- [ ] Keyboard-activate the About page accordion via Enter/Space on each of the 9 triggers — confirm expand/collapse works identically to mouse click and `aria-expanded` updates.
- [ ] Keyboard-activate the Class of 2030 video controls (mute, skip back/forward, fullscreen) via Tab + Enter/Space.
- [ ] Keyboard-only test of the homepage Class-of-2030 badge link and the "Coming Up" anchor trigger on `/gather` — confirm both are reachable and activatable via keyboard, not just mouse hover/click (note several elements use `tabindex="-1"` intentionally, e.g., the About page's decorative scroll-arrow — confirm that one is genuinely decorative and not the only path to `#story`).
- [ ] Screen reader pass (VoiceOver on macOS/iOS, NVDA or JAWS on Windows) on at least `/`, `/about`, `/gather`, `/connect` — confirm the Google Form iframe (`title="SVC Connect"`) is announced meaningfully and its contents are actually reachable/operable inside the iframe.
- [ ] Verify color contrast programmatically (not just by eye) on every distinct text/background combination across all 5 campus color themes (SJSU navy/gold, plus Stanford/SCU/UCSC/De Anza's themes) — the confirmed failure on the default theme's `.where-footnote` (Section 0) suggests the campus-specific override colors should get the same scrutiny.
- [ ] Confirm `prefers-reduced-motion` is respected somewhere (see Section 0 finding — currently it is not) before shipping further motion-heavy pages; at minimum gate the homepage's polaroid-drop sequence, the Class of 2030 bokeh/sparkle/scrolling-banner, and the Nav logo tilt behind a reduced-motion check.
- [ ] Confirm `lang="en"` on `<html>` (set in `BaseLayout.astro`) is accurate for all page content (it is, currently — no non-English content exists).
- [ ] Test the site with a browser-level forced-colors/high-contrast mode (Windows High Contrast) — verify nav, buttons, and the accordion remain usable and legible.

---

## 5. SEO Technical Checks

- [ ] **Title tags** — confirm every page has a unique, descriptive `<title>` (verified in source: all 12 pages currently have distinct titles, e.g. `"Silicon Valley College Church"`, `"About | Silicon Valley College Church"`, `"San José State | Silicon Valley College Church"`, etc.) — re-verify after any future page additions that titles stay unique and under ~60 characters where possible (spot check: `"Class of 2030 · Silicon Valley College Church"` and several campus titles are close to/over typical SERP truncation length — measure actual pixel/character truncation in a SERP preview tool).
- [ ] **Meta descriptions** — confirm every page passes a non-empty, unique `description` prop to `BaseLayout` (verified present on all 12 routes) and that each is within the ~150–160 character range for full display in search results — several (e.g., `about.astro`'s description) run long; measure and trim if needed.
- [ ] **Canonical URLs** — `BaseLayout.astro` defaults `canonicalUrl` to `Astro.url.href`; confirm this resolves to the correct **production** domain (not a Netlify/Vercel preview URL or `localhost`) once actually deployed, and that trailing slashes are consistent (Astro's default `trailingSlash` behavior — verify `/about` vs `/about/` doesn't produce a canonical/actual-URL mismatch, since the sitemap output shows trailing-slash URLs like `https://svcollegechurch.org/about/`).
- [ ] **Sitemap** — confirm `sitemap-index.xml` → `sitemap-0.xml` chain is reachable at the production URL, lists all 11 real routes (confirmed correct in local build), correctly excludes `/404`, and matches what's declared in `robots.txt`'s `Sitemap:` directive.
- [ ] **robots.txt** — confirm `Allow: /` for `User-agent: *` is intentional (no pages should be blocked from indexing) and the `Sitemap:` URL uses the correct production domain.
- [ ] **Open Graph tags** — verify `og:title`, `og:description`, `og:url`, `og:image` (resolved via `new URL(ogImage, Astro.site)`), `og:type`, `og:locale`, `og:site_name` all render correctly per-page and that the shared default `og-image.png` (generated by `scripts/generate-og.mjs`, 1200×630) actually displays correctly when a link is shared on iMessage, Slack, Facebook, and Twitter/X (each has different image-fetch/caching quirks — test with each platform's actual debugger/scraper tool: Facebook Sharing Debugger, Twitter Card Validator).
- [ ] **Twitter Card** — confirm `twitter:card` is `summary_large_image` and image/title/description resolve correctly (no dedicated per-page OG image exists — every page currently shares the one generic `og-image.png`; confirm this is an accepted tradeoff, not an oversight, especially for `/class-of-2030` and `/gather` which likely deserve distinct social preview images).
- [ ] **Structured data (JSON-LD)** — validate the `Church` schema block in `BaseLayout.astro` (name, alternateName, description, url, logo, sameAs, address, openingHoursSpecification) through Google's Rich Results Test and Schema.org validator; confirm the address (`2346 Walsh Ave, Santa Clara, CA 95051`) and Sunday `12:00–14:00` hours are current and accurate. Note this JSON-LD block is rendered identically on **every page** (it's in the shared layout) — confirm that's intentional for a single-organization site rather than needing per-page structured data (e.g., `Event` schema on `/gather` for upcoming events, which doesn't currently exist).
- [ ] **Duplicate content** — confirm no two pages have substantially the same title/description/content (all currently look distinct).
- [ ] **Image alt text** — cross-reference with Section 4; alt text serves double duty for SEO image search.
- [ ] **Mobile-friendliness** — confirm Google's Mobile-Friendly Test passes for representative pages (home, about, a campus page, class-of-2030).
- [ ] **`theme-color` / `apple-touch-icon`** — confirm `#0A0A0A` theme-color renders correctly in supporting mobile browser chrome, and that `/images/svc-logo-black.png` used as the apple-touch-icon is actually squared/sized appropriately for a home-screen icon (it's the full wordmark logo per `about.astro`'s import, not necessarily a square icon-optimized asset — verify how it actually looks pinned to an iOS home screen).
- [ ] **Indexability of the Google Form on `/connect`** — confirm the iframe embed doesn't create duplicate-content or crawl issues, and that `/connect`'s own meta description accurately describes the page (it does).
- [ ] Once a real production URL is live, re-run the entire SEO section against the actual deployed domain, not just local `astro build` output — several checks (canonical resolution, sitemap reachability, OG image absolute URL) can only be fully verified against production.

---

## 6. Performance

- [ ] Run Lighthouse (or reference `.github/workflows/audit.yml`'s advisory Lighthouse CI job, currently `continue-on-error: true` with warn-only thresholds of 0.8 performance / 0.9 accessibility / 0.8 best-practices / 0.9 SEO) against all pages and record actual scores — since it's advisory-only, nothing currently blocks a performance regression from merging.
- [ ] **LCP (Largest Contentful Paint)** — pay specific attention to `/class-of-2030` (15 MB autoplay video is likely the LCP element or delays it) and `index.astro` (4 large polaroid photos loaded and shuffled client-side on every load, plus a font-heavy hero). Measure LCP on throttled 4G/mobile CPU profiles, not just fast desktop wifi.
- [ ] **CLS (Cumulative Layout Shift)** — verify the `EventBanner.astro`'s dynamic height (computed via JS after mount, shifting `body` padding and nav position) doesn't cause a visible layout jump on initial page load, especially before the script runs. Verify Google Fonts loading (`Cormorant Garamond`, `Instrument Sans`, `Unbounded`, plus `Bebas Neue`/`Plus Jakarta Sans` on `/class-of-2030`) doesn't cause FOUT/FOIT-driven reflow — no `font-display` strategy is visible in the `@import` URLs; check whether Google's stylesheet applies one by default and whether it's sufficient.
- [ ] **TBT (Total Blocking Time)** — the homepage's hero sequence, the Class of 2030 sparkle canvas (`requestAnimationFrame` particle system running continuously while on that page), and the 10 CSS-animated bokeh orbs are candidates for main-thread cost; profile with Chrome DevTools Performance panel, not just a single Lighthouse score.
- [ ] **Video weight** — `public/videos/svc-welcome-2030.mp4` is **15 MB**; confirm it's reasonably compressed for web delivery (check actual bitrate/resolution vs. its displayed size), and consider whether a lower-resolution/bitrate re-encode or adaptive source set is warranted given this plays automatically on page load for every visitor, including mobile/cellular users.
- [ ] **Image optimization** — confirm Astro's `astro:assets` pipeline is actually being used for every content image (it is, for community photos, campus logos, `suhfam.png`, `mentors.png` — all imported from `src/assets/` and processed via `<Image>`/`getImage`); confirm the **unused** `public/images/campuses/*.jpg` (3.7 MB, Section 0) aren't inflating page weight on any page that might accidentally reference them by raw path in the future.
- [ ] Verify `loading="eager"` is used only where appropriate (the nav logo, explicitly marked eager since it's always above the fold) and `loading="lazy"` elsewhere (Connect page iframe, Class of 2030 banner photos) — confirm no above-the-fold image is incorrectly marked lazy (which would delay LCP).
- [ ] Measure total transferred bytes and request count per page on a throttled "Slow 4G" profile — flag any page exceeding a reasonable budget (e.g., >2–3 MB for a text/photo page; the video page is expected to be heavier but should still be measured and justified).
- [ ] Confirm `astro:transitions` client-side navigation doesn't cause a memory leak over an extended session (navigate through all 12 pages repeatedly, then check DevTools Memory/Performance for detached DOM nodes or growing listener counts — particularly relevant given several pages register `document.addEventListener` inside `astro:page-load` handlers that need matching cleanup on `astro:before-swap`, which only `class-of-2030.astro`'s sparkle canvas explicitly does).
- [ ] Confirm preconnect hints (`fonts.googleapis.com`, `fonts.gstatic.com`) are actually beneficial given fonts are loaded via `@import` inside a CSS file rather than a `<link rel="stylesheet">` in `<head>` — `@import`-loaded stylesheets can't start downloading until the CSS file itself is parsed, partially negating the preconnect's timing advantage; consider converting to direct `<link>` tags for faster font discovery.

---

## 7. Content / Copy QA

- [ ] Full copy-edit proofread pass across all pages for typos, grammar, and tone consistency (spot-checked in this review; no glaring typos found, but a dedicated read-through by a second person is still warranted).
- [ ] **Date-sensitive content audit** (highest priority given today's date): both seed events in `src/content/events/` (`does-science-disprove-god.md` — April 22, 2026; `senior-sunday.md` — May 17, 2026) are already in the past — confirm these are either removed, replaced with real upcoming events, or intentionally left as historical/demo content before launch (see Section 0).
- [ ] Verify the Sunday gathering time/location on `/gather` ("Sundays · 12 PM", "SVC Student Center, 2346 Walsh Ave, Santa Clara") and the JSON-LD `openingHoursSpecification` (`Sunday 12:00–14:00`) in `BaseLayout.astro` **agree with each other** and with reality — two independent sources of truth for the same fact is a drift risk; consider deriving one from the other.
- [ ] Verify the church's physical address (`2346 Walsh Ave, Santa Clara, CA 95051`) is identical across `BaseLayout.astro`'s JSON-LD, `gather.astro`'s "Where" section, and every event's `address`/`mapUrl` frontmatter field — confirm the Google Maps link (`https://maps.app.goo.gl/XnKMeboUpYpEXNxB8`) actually resolves to the correct location.
- [ ] Verify all external links resolve (not 404/parked/redirected to an unrelated page): `course101.online`, `devotions.acts2.network`, the Google Sites Bible-resources page, `apologeticsqna.com`, `acts2.network`, `acts2college.org`, `namb.net/send-network`, Instagram (`sv.collegechurch`, `klesis_sjsu`, `4corners_sjsu`, and equivalents on the other campus pages), Spotify show URL.
- [ ] Confirm the Google Form embedded on `/connect` is the **current, active** form (not a deprecated/duplicate one), and that submitting a real test entry actually reaches whatever inbox/sheet the church expects.
- [ ] Confirm each campus ministry's name, leadership, and social handles in `sjsu.astro`/`stanford.astro`/`scu.astro`/`ucsc.astro`/`deanza.astro` are current — ministry names/leaders at colleges can change year to year; this content should have an owner who re-verifies it each academic year.
- [ ] Verify the "Class of 2030" framing/copy is intentional messaging tied to the current admissions cycle (i.e., incoming freshmen who will graduate in 2030) and gets updated to "Class of 2031" etc. on the appropriate annual cadence — check if there's a process/reminder for this rename, since it's hardcoded as literal text/IDs (`#c30-main`, `class-of-2030` route, "CLASS · 2030" badge) across multiple files, not driven by a single config value.
- [ ] Confirm the Statement of Faith wording and all cited Bible references (`about.astro`, 9 belief items with verse citations like "2 Tim. 3:16–17", "Gen. 1:26", etc.) are accurate and match the intended denominational statement (Southern Baptist Convention / SEND Network affiliation is stated on the page — verify this affiliation claim is current and accurate).
- [ ] Check for any remaining Lorem Ipsum, "TODO", "TBD", "Coming soon", or bracketed placeholder text (`[Name]`, `{{...}}`) across all pages — none found in this review, but re-check after any future content changes.
- [ ] Confirm the `README.md`'s documented file structure and setup instructions stay in sync with the actual repo (already found one drift — Section 0's `favicon.svg` vs `favicon.png`, and the Bun-vs-npm lockfile question).

---

## 8. Security Basics (Static Site)

- [ ] Confirm the production deployment enforces **HTTPS** (redirects HTTP → HTTPS) and that `svcollegechurch.org` has a valid, non-expiring-soon TLS certificate (verify actual cert expiry once live).
- [ ] Confirm no secrets, API keys, or credentials are present anywhere in the repo (checked `astro.config.mjs`, `package.json`, workflow files — none found; site has no server-side/API integration currently, only a public Google Form embed).
- [ ] All external links using `target="_blank"` carry `rel="noopener noreferrer"` — **confirmed already correct** across every instance found in `Footer.astro`, `about.astro`, `gather.astro`, and all 5 campus pages (19 matches, all with `rel` present) — re-verify this holds for any newly added external link in the future, since it's easy to forget on a copy-pasted `<a>`.
- [ ] Confirm the Google Form iframe on `/connect` doesn't request or transmit sensitive data insecurely — verify the iframe's `src` is served over HTTPS (it is: `https://docs.google.com/forms/...`).
- [ ] Confirm no inline `<script>` blocks execute untrusted/user-supplied content — the only dynamic `set:html` usage found is the JSON-LD block in `BaseLayout.astro`, which serializes static, developer-authored data (not user input), so injection risk is low — confirm this remains true if any future feature introduces user-generated content.
- [ ] Check response headers once deployed for reasonable security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`) — none are currently configurable from this static Astro setup by default; confirm whether the hosting platform (GitHub Pages doesn't support custom headers without a CDN in front) needs a Cloudflare/other proxy layer if these are required.
- [ ] Confirm `robots.txt`/sitemap don't inadvertently expose any non-public or staging routes.
- [ ] Confirm no `console.log`/debug statements leak internal information in production builds (spot-checked — none found in the reviewed source).
- [ ] Since this is a fully static site with no server-side form handling or database, most traditional static-site security risks are already minimized — the main residual surface is the third-party Google Form iframe and the GitHub Actions deploy pipeline itself (confirm branch protection on `main` and required CI checks before merge, given `deploy.yml` triggers on every push to `main`).

---

## 9. Build / Deploy Checks

- [ ] `npm run build` completes with no errors — **confirmed passing** in this review (12 pages built, sitemap generated, ~22 MB output).
- [ ] `npx astro check` — **currently reports 9 errors** in `about.astro` plus 2 deprecation warnings (`ViewTransitions`) and 1 hint (inline JSON-LD script) — confirmed in this review (see Section 0). Decide whether `ci.yml`'s `continue-on-error: true` on this step should be removed once fixed, to make it a real blocking gate.
- [ ] `.github/workflows/ci.yml` ("Quality Gate") runs on every PR to `main`: type-check (advisory) + build (blocking) — confirm both steps are actually required by branch protection rules on GitHub, not just present in the workflow file.
- [ ] `.github/workflows/audit.yml` ("Site Audit") runs build → accessibility (axe, blocking) → link-check (linkinator, blocking) → Lighthouse (advisory) on every push/PR — confirm this workflow is actually green on `main` right now, and that its accessibility/link-check jobs are configured as **required** status checks, not just present.
- [ ] `.github/workflows/deploy.yml` deploys to GitHub Pages on every push to `main` **and** on a daily 08:00 UTC cron (explicitly to keep date-driven content like the event banner current) — confirm the cron is actually firing (check Actions run history for scheduled runs, not just push-triggered ones) and that a cron-triggered rebuild with no code changes still succeeds end-to-end.
- [ ] Confirm the `site` field in `astro.config.mjs` (`https://svcollegechurch.org`) matches the actual production domain **before** the next deploy — this directly affects sitemap URLs, canonical tags, and OG image absolute URLs (see Section 0's CNAME finding).
- [ ] Confirm `output: 'static'` remains correct (no server-rendered routes have been introduced that would require `output: 'server'`/`'hybrid'` and a different hosting adapter).
- [ ] Verify `bun.lock` vs `package-lock.json` drift is resolved (Section 0) so local (`bun install`) and CI (`npm ci`) dependency resolution can't silently diverge.
- [ ] Confirm `dist/` is `.gitignore`d (not accidentally committed) and that the deploy artifact uploaded in `deploy.yml` (`actions/upload-pages-artifact@v3`, path `dist/`) matches what's produced locally.
- [ ] Confirm `@astrojs/check`, `astro`, `@astrojs/tailwind`, `@astrojs/sitemap`, `tailwindcss`, `typescript` versions in `package.json` are intentionally pinned/ranged (currently all use `^` ranges) and there's a process for reviewing/testing before accepting minor/patch version bumps, especially for `astro` itself given the active `ViewTransitions` deprecation in v5.
- [ ] Confirm the build is reproducible from a clean clone (`git clone` → `npm ci` → `npm run build`) without relying on any locally-cached state, uncommitted files, or environment variables that aren't documented.

---

## 10. Browser Console Error/Warning Checks

- [ ] Open DevTools Console on every one of the 12 pages (fresh load, not cached) and confirm **zero errors** and **zero unexpected warnings**.
- [ ] Specifically watch for: failed image/video/font network requests (404s), CORS errors from the Google Form iframe or Google Fonts, `IntersectionObserver`/`ResizeObserver` errors, and any TypeScript-runtime-manifested null-reference errors corresponding to the 9 `astro check` errors in `about.astro`'s accordion script (click every accordion item while watching the console specifically, since the type errors flag real potential null-dereferences even though they may not trigger in the current markup).
- [ ] Check console during and after every interactive sequence: homepage polaroid drop/fan/swipe, Nav logo tilt + emoji hover/click, About accordion open/close, Connect iframe load, Gather "Coming Up" scroll, Class of 2030 mute/skip/fullscreen/sparkle-canvas, 404 sheep click/flee.
- [ ] Check console specifically during **client-side navigations** (View Transitions) between pages with different global style overrides (e.g., home → SJSU campus → Stanford campus → home) — verify no errors from duplicate event-listener registration (several scripts re-run on every `astro:page-load` without first removing prior listeners) or from `astro:before-swap` cleanup logic running against already-removed DOM nodes.
- [ ] Confirm no "deprecated API" browser-native console warnings appear (separate from the build-time `astro check` deprecation warning about `ViewTransitions`) — e.g., check for any deprecated DOM API usage surfacing at runtime in Chrome/Firefox/Safari consoles.
- [ ] Check the Network tab on every page for any 404/failed requests beyond what's already known (e.g., confirm the video poster, video source, all campus logo images, and all community photos resolve with 200 status).
- [ ] Run this pass on both a fresh (empty cache) load and a repeat (warm cache) load, since some of the animation/reset logic explicitly accounts for "already visited" state via View Transitions and could behave differently.

---

## Appendix: Route Inventory (for test-tracking spreadsheets)

| Route | Source file | Notable features to re-test on every change |
|---|---|---|
| `/` | `src/pages/index.astro` | Polaroid hero sequence, Class of 2030 badge |
| `/about` | `src/pages/about.astro` | Accordion (9 items), 2 photos, accordion `astro check` errors |
| `/connect` | `src/pages/connect.astro` | Google Form iframe + skeleton loader |
| `/gather` | `src/pages/gather.astro` | When/Where, EventBanner, UpcomingEvents |
| `/campuses` | `src/pages/campuses/index.astro` | 5-campus list, View Transition shared elements |
| `/campuses/sjsu` | `src/pages/campuses/sjsu.astro` | Navy/gold theme, 2 ministry groups |
| `/campuses/stanford` | `src/pages/campuses/stanford.astro` | Distinct theme, 2 ministry groups |
| `/campuses/scu` | `src/pages/campuses/scu.astro` | Distinct theme, 1 ministry group |
| `/campuses/ucsc` | `src/pages/campuses/ucsc.astro` | Distinct theme, 1 ministry group |
| `/campuses/deanza` | `src/pages/campuses/deanza.astro` | Distinct theme, 1 ministry group |
| `/class-of-2030` | `src/pages/class-of-2030.astro` | 15 MB autoplay video, sparkle canvas, dark theme |
| `/404` | `src/pages/404.astro` | Custom error page, wandering sheep game |
