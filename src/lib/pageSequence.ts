// Single source of truth for the site's mobile scroll-to-navigate order.
// BaseLayout.astro's touch gesture and Footer.astro's "only on the last
// page" visibility both derive from this array — reorder pages here and
// both stay correct automatically.

export const PAGE_SEQUENCE = ['/', '/gather', '/campuses', '/connect', '/about'] as const;

export type SequencePath = (typeof PAGE_SEQUENCE)[number];

export const PAGE_LABELS: Record<SequencePath, string> = {
  '/': 'Home',
  '/gather': 'Gather',
  '/campuses': 'Campuses',
  '/connect': 'Connect',
  '/about': 'About',
};

export const LAST_PAGE: SequencePath = PAGE_SEQUENCE[PAGE_SEQUENCE.length - 1];

export function isSequencePage(pathname: string): pathname is SequencePath {
  return (PAGE_SEQUENCE as readonly string[]).includes(pathname);
}

export interface SequenceTarget {
  href: SequencePath;
  label: string;
}

// Linear, not circular — the last page has no "next" and the first page
// has no "prev", so the gesture stops instead of wrapping around.

export function getNextPage(pathname: string): SequenceTarget | null {
  const idx = PAGE_SEQUENCE.indexOf(pathname as SequencePath);
  if (idx === -1 || idx === PAGE_SEQUENCE.length - 1) return null;
  const href = PAGE_SEQUENCE[idx + 1];
  return { href, label: PAGE_LABELS[href] };
}

export function getPrevPage(pathname: string): SequenceTarget | null {
  const idx = PAGE_SEQUENCE.indexOf(pathname as SequencePath);
  if (idx <= 0) return null;
  const href = PAGE_SEQUENCE[idx - 1];
  return { href, label: PAGE_LABELS[href] };
}
