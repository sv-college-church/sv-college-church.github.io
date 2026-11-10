// Standing pickups for the Sunday gathering. List a campus only when its
// pickup is public; Gather sends everyone else to the Connect page.
// A one-day change goes on that Sunday's event as `rideTimes`, so it expires
// with the listing.
export const SUNDAY_PICKUPS = {
  sjsu: { place: 'Washburn Hall', time: '11:30 AM' },
  ucsc: { place: 'Baskin Engineering', time: '10:30 AM' },
} as const;
