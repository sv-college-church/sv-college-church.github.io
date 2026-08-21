# Welcome Week Past Event Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the SJSU Welcome Week events that ended before August 20, 2026, leaving only the August 21 and August 23 events.

**Architecture:** Keep the existing static `schedule` array as the single source for both rendered schedule rows and Event JSON-LD. Remove only the five past event objects; do not add runtime filtering or archive state.

**Tech Stack:** Astro 5, TypeScript, Bun, Node.js assertions against generated HTML

## Global Constraints

- Remove the schedule entries for August 15, 16, 17, 18, and 19.
- Keep the August 21 bonfire and August 23 church service unchanged.
- Make no layout, styling, hero copy, navigation, CTA, or event-detail changes.
- Ensure both the visible schedule and Event JSON-LD contain only the two upcoming events.

---

### Task 1: Remove Past Welcome Week Events

**Files:**
- Modify: `src/pages/campuses/sjsu/welcome-week.astro:29-119`
- Verify: `dist/campuses/sjsu/welcome-week/index.html`

**Interfaces:**
- Consumes: The existing `schedule` array used by the schedule renderer and `structuredData`.
- Produces: A two-entry `schedule` array containing the August 21 bonfire and August 23 church service.

- [ ] **Step 1: Build the current page and run the future-only assertion**

Run:

```bash
bun run build
node --input-type=module <<'NODE'
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('dist/campuses/sjsu/welcome-week/index.html', 'utf8');
const scheduleRows = html.match(/class="ww-row"/g) ?? [];
const eventJsonLd = html.match(/"@type"\s*:\s*"Event"/g) ?? [];

assert.equal(scheduleRows.length, 2, `expected 2 schedule rows, found ${scheduleRows.length}`);
assert.equal(eventJsonLd.length, 2, `expected 2 Event JSON-LD objects, found ${eventJsonLd.length}`);

for (const pastDate of ['AUG 15', 'AUG 16', 'AUG 17', 'AUG 18', 'AUG 19']) {
  assert.ok(!html.includes(pastDate), `found past visible date ${pastDate}`);
}

for (const pastStart of [
  '2026-08-15T17:30:00-07:00',
  '2026-08-16T12:00:00-07:00',
  '2026-08-17T19:30:00-07:00',
  '2026-08-18T18:00:00-07:00',
  '2026-08-19T18:30:00-07:00',
]) {
  assert.ok(!html.includes(pastStart), `found past structured-data start ${pastStart}`);
}

for (const upcomingValue of ['AUG 21', 'AUG 23', '2026-08-21T17:30:00-07:00', '2026-08-23T12:00:00-07:00']) {
  assert.ok(html.includes(upcomingValue), `missing upcoming value ${upcomingValue}`);
}
NODE
```

Expected: `bun run build` succeeds, then the Node assertion fails with `expected 2 schedule rows, found 7`.

- [ ] **Step 2: Remove the five past event objects**

Replace the `schedule` declaration in `src/pages/campuses/sjsu/welcome-week.astro` with:

```ts
const schedule = [
  {
    day: 'FRI',
    date: 'AUG 21',
    name: 'SJSU Bonfire',
    sub: "Stories, s'mores, worship",
    location: 'TBA',
    note: null,
    time: '5:30 – 7:30 PM',
    start: '2026-08-21T17:30:00-07:00',
    end: '2026-08-21T19:30:00-07:00',
  },
  {
    day: 'SUN',
    date: 'AUG 23',
    name: 'Silicon Valley Church',
    sub: 'Worship together',
    location: 'Horace Mann',
    mapUrl: horaceMannMapUrl,
    note: null,
    time: '12:00 – 1:30 PM',
    start: '2026-08-23T12:00:00-07:00',
    end: '2026-08-23T13:30:00-07:00',
  },
];
```

- [ ] **Step 3: Rebuild and verify the visible and structured schedules**

Run the same build and Node assertion from Step 1.

Expected: `bun run build` succeeds and the Node process exits successfully with no assertion error.

- [ ] **Step 4: Check the edited diff for whitespace errors**

Run:

```bash
git diff --check -- src/pages/campuses/sjsu/welcome-week.astro
```

Expected: The command exits successfully with no output. The file has pre-existing
Prettier drift outside this change, so do not reformat unrelated markup or CSS.

- [ ] **Step 5: Commit the page update**

```bash
git add src/pages/campuses/sjsu/welcome-week.astro
git commit -m "content: remove past Welcome Week events" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```
