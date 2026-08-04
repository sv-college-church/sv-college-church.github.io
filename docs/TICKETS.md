# Ticket Tracker

Mirrors the "Feedback" tracking sheet. Add new tickets at the bottom of the table; check `Fixed` when resolved.

| # | Feedback | Submitted | Priority | URL to Page | Submitter | Fixed |
| - | -------- | --------- | -------- | ------------ | --------- | ----- |
| 1 | About page accordion script (`src/pages/about.astro`, toggle logic around lines 547–561) throws TypeScript strict-mode errors — `querySelector` results and `content`/`item` elements are used without null checks, and `.style` is accessed on a plain `Element` type. Doesn't break the current dev/build output, but fails `npx astro check` and is a latent runtime risk if the markup ever changes. | 2026-07-24 | Medium | /about | Claude (QA check) | ☑ |
| 2 | Create separate page for Welcome Week (+ banner or tab) | 2026-07-24 | High | N/A | Jeanine | ☐ |
| 3 | Event flyer easily downloadable | 2026-07-24 | High | N/A | Jeanine | ☐ |
| 4 | Schedule of events (maybe same as above) | 2026-07-24 | High | N/A | Jeanine | ☐ |
| 5 | Update SJSU page to make it more fun/engaging | 2026-07-24 | High | https://svcollegechurch.org/campuses/sjsu/ | Jeanine | ☐ |
| 6 | Change photo and blurb in About to Lo family | 2026-07-24 | High | https://svcollegechurch.org/about/#story | Jeanine | ☐ |
| 7 | SEO? To make Silicon Valley church show up higher on Google Search | 2026-07-24 | Low | N/A | Jeanine | ☐ |
| 8 | Who has the responses for survey? | 2026-07-24 | High | https://svcollegechurch.org/connect/ | Jeanine | ☐ |
| 9 | Add the statement of faith verbiage. Right now the clicks don't work | 2026-07-24 | Medium | https://svcollegechurch.org/about/ | Jeanine | ☐ |
| 10 | Add a visible play/pause control to the autoplaying/looping video on the Class of 2030 page (`c30-vid`) — currently mute, fullscreen, and ±5s skip controls exist but there's no way to stop the loop. | 2026-08-04 | Medium | https://svcollegechurch.org/class-of-2030 | Claude (QA audit) | ☐ |
| 11 | Two committed lockfiles (`bun.lock` and `package-lock.json`) contradict each other: README instructs Bun for all commands, but all 3 GitHub Actions workflows (`ci.yml`, `deploy.yml`, `audit.yml`) run npm. Needs a decision on canonical package manager before cleanup (update workflows to Bun, or rewrite README + delete `bun.lock`). | 2026-08-04 | Low | N/A | Claude (QA audit) | ☐ |
| 12 | Two seed event entries are past-dated and need real replacement content: `does-science-disprove-god.md` (date 2026-04-22) and `senior-sunday.md` (date 2026-05-17), both before today (2026-08-04). Site correctly hides expired events, but "Coming Up" section is effectively empty until fresh events are added. | 2026-08-04 | Medium | N/A | Claude (QA audit) | ☐ |
