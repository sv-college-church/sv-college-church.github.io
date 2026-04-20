import { getCollection, type CollectionEntry } from 'astro:content';

export type EventEntry = CollectionEntry<'events'>;

const DEFAULT_BANNER_LEAD_DAYS = 21;

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** Last day the event is still "current" (endDate if set, else date). */
export function eventEndDay(event: EventEntry): Date {
  return startOfDay(event.data.endDate ?? event.data.date);
}

/** First day the banner should appear (bannerStartsAt if set, else 21 days before date). */
export function bannerStartDay(event: EventEntry): Date {
  if (event.data.bannerStartsAt) return startOfDay(event.data.bannerStartsAt);
  const start = new Date(event.data.date);
  start.setDate(start.getDate() - DEFAULT_BANNER_LEAD_DAYS);
  return startOfDay(start);
}

/** Events whose end day is today or later, sorted soonest first. */
export async function getUpcomingEvents(now: Date = new Date()): Promise<EventEntry[]> {
  const today = startOfDay(now);
  const all = await getCollection('events');
  return all
    .filter((e) => eventEndDay(e).getTime() >= today.getTime())
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

/**
 * The single banner-tier event that should be visible right now.
 * - tier === 'banner'
 * - bannerStartDay <= today <= eventEndDay
 * - has banner data
 * - if multiple, soonest date wins
 */
export async function getActiveBannerEvent(
  now: Date = new Date()
): Promise<EventEntry | null> {
  const today = startOfDay(now).getTime();
  const upcoming = await getUpcomingEvents(now);
  const candidates = upcoming.filter(
    (e) =>
      e.data.tier === 'banner' &&
      e.data.banner &&
      bannerStartDay(e).getTime() <= today
  );
  return candidates[0] ?? null;
}

/** Banner + featured upcoming events (for /gather callout, homepage strip). */
export async function getHighlightedEvents(now: Date = new Date()): Promise<EventEntry[]> {
  const upcoming = await getUpcomingEvents(now);
  return upcoming.filter((e) => e.data.tier === 'banner' || e.data.tier === 'featured');
}
