# Welcome Week Past Event Removal

## Goal

Remove the SJSU Welcome Week events that ended before August 20, 2026, so the page shows only upcoming events.

## Scope

Edit `src/pages/campuses/sjsu/welcome-week.astro` and remove the schedule entries for August 15, 16, 17, 18, and 19. Keep the August 21 bonfire and August 23 church service unchanged.

No layout, styling, hero copy, navigation, CTA, or event-detail changes are included.

## Implementation

Delete the five past event objects from the existing `schedule` array. The visible schedule and Event JSON-LD both derive from this array, so one data change removes the past events from both surfaces without adding filtering logic or duplicate state.

## Verification

Build the Astro site and inspect the generated Welcome Week page to confirm:

- Only the August 21 and August 23 schedule rows remain.
- Only those two events appear in Event JSON-LD.
- The page still builds successfully.
