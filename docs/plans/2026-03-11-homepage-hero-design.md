# Homepage Hero Animation Design

## Context

Silicon Valley College Church — targeting young adults and college students. Design philosophy: minimalistic, sleek, well-crafted.

## Overview

A cinematic 5-second intro sequence on the homepage. No nav visible initially. Just a breathing Polaroid photo that slides left, followed by typewriter welcome text.

## Animation Sequence (5s total)

| Time   | Action                                                                 |
|--------|------------------------------------------------------------------------|
| 0–0.5s | Polaroid fades in at center-screen                                     |
| 0.5–3s | Breathing animation plays; one photo crossfade at ~2s                  |
| 3–4s   | Polaroid slides to left third of screen                                |
| 4–5s   | Typewriter types: "Welcome to SVC.\nWe're glad you're here."           |
| 5s+    | Nav fades in; Polaroid continues breathing gently in left position     |

## Polaroid

- Square frame, ~35% of viewport width
- White border (`~16–20px`), rounded corners (`border-radius: 12px`)
- Subtle `box-shadow` for depth
- Inner image fills the frame with `object-fit: cover`
- Photos: `church-beach.jpg`, `church-cliff.jpg`, `church-easter.jpg`, `church-train.jpg`
- Crossfade every ~2.5s via JS toggling `active` class with CSS opacity transition

## Breathing Animation

- CSS `@keyframes` combining `translateY` (2px drift) and `scale` (~1.02)
- 3.5s cycle, `ease-in-out`, loops indefinitely
- Continues in new position after slide

## Slide Left

- At 3s, JS adds a class that transitions Polaroid to left-third position
- `transition: all 0.8s ease-in-out`
- Breathing continues after repositioning

## Typewriter Text

- Starts at 4s after slide begins
- Font: `font-display`, size `text-4xl`/`text-5xl`
- Two lines:
  - Line 1: `Welcome to SVC.` — pause 0.3s after completion
  - Line 2: `We're glad you're here.`
- Blinking cursor `::after` pseudo-element, fades out after typing completes
- Text container fades in as Polaroid slides (at 3s)

## Nav

- Starts `opacity: 0` on page load
- Fades in at 5s with short transition (`0.4s ease`)

## Implementation

- Modify `src/pages/index.astro` only
- Pure CSS `@keyframes` + vanilla JS `setTimeout`/`setInterval`
- No new dependencies
