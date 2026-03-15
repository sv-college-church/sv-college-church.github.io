# SVC Design Language

A reference for maintaining visual and editorial consistency across the site.

---

## Aesthetic Direction

**Minimalist zine / editorial magazine.** The site is not a web app or a brochure — it reads like a well-designed print magazine that happens to be interactive. Each page creates focused, deliberate moments rather than presenting all information at once.

---

## Core Principles

### 1. One idea per viewport
Sections use `min-height: 85vh` or full `100svh`. The reader focuses on one thing before scrolling to the next. Never cram multiple ideas into a single screen.

### 2. Dramatic type hierarchy
The contrast between type sizes is extreme and intentional:
- **Display titles**: `clamp(3rem, 8vw, 8rem)` — massive, uppercase, Instrument Sans black
- **Section labels**: `0.65rem`, `700` weight, uppercase, `letter-spacing: 0.22em`, `32%` opacity — tiny editorial waypoints
- **Body text**: `clamp(1.15rem, 1.8vw, 1.5rem)`, Instrument Sans `600`, `line-height: 1.75`
- **Display info** (names, times, places): Cormorant Garamond italic at large sizes

### 3. Serif/sans interplay
**Never use only one font family on a page.** The tension between the two is part of the identity:
- **Cormorant Garamond** — italic, for display info: names ("Steve & Suzanne"), times ("Sundays"), places ("2346 Walsh Ave"), section decoration
- **Instrument Sans** — for titles, labels, body text, UI elements

### 4. Choreographed reveals
Content earns attention:
- Heroes use staggered word-by-word animations (`animation-delay` increments)
- Sections use `data-animate` + IntersectionObserver to fade up on scroll
- Each section reveals independently — not all at once

### 5. Vertical rhythm markers
Every section transition uses the same grammar:
- Thin `section-rule`: `width: 1px; height: 3.5rem; background: rgb(10 10 10 / 0.18)` — appears before section label
- `border-t border-ink/10` dividers between sections
- Tiny uppercase `section-label` as the editorial waypoint into each section

### 6. Generous negative space
- Section padding: `6rem 2rem` minimum
- Content columns: `max-width: 55rem` centered
- When/Where split on church page gives each column `min-height: 50vh`
- Resist the urge to fill space

### 7. One signature interaction per page
Each page has exactly one special moment — restrained, not overdone:
- **Home**: Polaroid cards fan out on hover
- **Church**: Text scramble animation when switching Easter mode
- **About**: Accordion for Statement of Faith

### 8. Photography
Where it exists, photography anchors the page. `aspect-ratio: 3/2` or `21/9`, full-width within content columns, thin `1.5px` border at `12-15%` ink opacity.

---

## Color System

```
ink:    #0A0A0A  — primary text, borders, UI
paper:  #F5F5F0  — background
accent: #D91C2A  — red; used sparingly (arrows, CTAs, hover states)
```

Use opacity for hierarchy — never add new colors. Examples:
- `rgb(10 10 10 / 0.32)` — section labels
- `rgb(10 10 10 / 0.78)` — body text
- `rgb(10 10 10 / 0.18)` — section rules, subtle borders
- `rgb(10 10 10 / 0.10)` — dividers

---

## Typography

| Role | Font | Weight | Style | Size |
|------|------|--------|-------|------|
| Page title / hero | Instrument Sans | 900 (black) | uppercase | `clamp(3rem, 8vw, 8rem)` |
| Display info | Cormorant Garamond | 400 | italic | `clamp(2.5rem, 5.5vw, 6rem)` |
| Display emphasis | Cormorant Garamond | 700 | normal | `clamp(3.5rem, 8vw, 9rem)` |
| Names | Cormorant Garamond | 400 | italic | `clamp(2.5rem, 5vw, 4.5rem)` |
| Section label | Instrument Sans | 700 | uppercase | `0.65rem`, `letter-spacing: 0.22em` |
| Body text | Instrument Sans | 600 | normal | `clamp(1.15rem, 1.8vw, 1.5rem)` |
| Small body / desc | Instrument Sans | 400–600 | normal | `0.8–0.9rem` |
| CTA / nav / meta | Instrument Sans | 700 | uppercase | `0.65–0.75rem`, wide tracking |

---

## Section Anatomy

A standard full-viewport section looks like:

```
border-t border-ink/10
  padding: 6rem 2rem
  min-height: 85vh
  display: flex; align-items: center; justify-content: center

  [data-animate]
    section-rule  (1px × 3.5rem, 18% ink)
    section-label ("OUR STORY", 0.65rem, 32% ink)
    ... content ...
```

---

## What to Avoid

- **Utility/directory layouts** — tables, dense grids, dashboards
- **All sans-serif pages** — always include Cormorant Garamond somewhere
- **Small sections** — resist `py-8` or `py-12` sections; they feel like filler
- **Multiple interactions** — one surprise per page, not many scattered micro-interactions
- **Generic CTAs** — "Get Connected" in a small throwaway section; give CTAs full-viewport weight
- **Flat pages** — every page needs at least one moment of typographic or photographic drama
