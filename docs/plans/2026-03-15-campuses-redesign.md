# Campuses Redesign

**Date:** 2026-03-15
**Pages affected:** `/campuses`, `/campuses/sjsu`, `/campuses/stanford`, `/campuses/ucsc`

---

## Goal

Replace the dense grid directory with a full-viewport editorial triptych that matches the zine design language. Three schools, three columns, one screen.

---

## Index Page (`/campuses/index.astro`)

### Layout
- Full viewport height, no scrolling
- Three equal columns using CSS Grid (`grid-template-columns: 1fr 1px 1fr 1px 1fr`)
- `1px` columns are the ink/10 dividers
- Each column: flex column with generous top/bottom padding, content centered vertically

### Each Column
- Tiny uppercase label: school short name (e.g. "SAN JOSÉ STATE") — `0.65rem`, `32%` ink opacity
- Large Cormorant Garamond italic school name — fills column width using `clamp` or `vw` sizing
- "Learn More →" link — Instrument Sans, `0.72rem`, uppercase, `40%` ink, transitions to full ink on hover

### Hover state
- Column school name shifts from `70%` ink to full ink
- Subtle transition, nothing dramatic

### View Transition
- Each column container gets a unique `view-transition-name`: `campus-sjsu`, `campus-stanford`, `campus-ucsc`
- Clicking a column navigates to the school page
- The column expands/morphs into the school page hero via Astro View Transitions

---

## School Pages (`/campuses/sjsu.astro`, etc.)

### Hero
- Matching `view-transition-name` on the hero section (e.g. `campus-sjsu`)
- Large Cormorant Garamond italic school name (same as index column)
- Small back link: `← Campuses`

### Groups section
- Lists all groups at that school
- Each group: logo, name, type badge, link to existing detail page
- Editorial row layout matching the About page resource rows

---

## Technical

- Add `<ViewTransitions />` to `BaseLayout.astro`
- Create three new school pages aggregating groups from existing data
- Update the campus data to be importable (extract to a shared data file or inline per page)
- Keep existing per-group pages (`/campuses/sjsu-klesis`, etc.) — school pages link into them

---

## Files to create/modify

| File | Action |
|------|--------|
| `src/layouts/BaseLayout.astro` | Add `<ViewTransitions />` |
| `src/pages/campuses/index.astro` | Full rewrite |
| `src/pages/campuses/sjsu.astro` | New |
| `src/pages/campuses/stanford.astro` | New |
| `src/pages/campuses/ucsc.astro` | New |
