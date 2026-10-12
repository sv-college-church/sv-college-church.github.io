import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { ModuleKind, transpileModule } from 'typescript';

const source = readFileSync(new URL('../src/lib/events.ts', import.meta.url), 'utf8');
const { outputText } = transpileModule(source, {
  compilerOptions: { module: ModuleKind.CommonJS },
});
const now = new Date('2000-01-10T12:00:00Z');

function fixture(id, campus, overrides = {}) {
  return {
    id,
    data: {
      title: 'Synthetic event fixture',
      date: new Date('2000-01-11'),
      tier: 'featured',
      campus,
      ...overrides,
    },
  };
}

function loadEvents(events) {
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require(name) {
      assert.equal(name, 'astro:content');
      return {
        async getCollection(collection) {
          assert.equal(collection, 'events');
          return events;
        },
      };
    },
  });
  return exports;
}

function ids(events) {
  return Array.from(events, (event) => event.id);
}

test('unscoped upcoming events retain all campuses, sorting and expiration', async () => {
  const events = loadEvents([
    fixture('later', 'deanza', { date: new Date('2000-01-12') }),
    fixture('past', 'all', { date: new Date('2000-01-09') }),
    fixture('sooner', 'svc'),
  ]);
  assert.deepEqual(ids(await events.getUpcomingEvents(now)), ['sooner', 'later']);
});

test('Gather highlights only church-wide events, not campus or listed events', async () => {
  const events = loadEvents([
    fixture('campus', 'deanza'),
    fixture('church', 'all'),
    fixture('svc', 'svc', { tier: 'banner' }),
    fixture('listed', 'all', { tier: 'listed' }),
  ]);
  assert.deepEqual(ids(await events.getHighlightedEvents(now)), ['church', 'svc']);
});

test('each campus selects only its own highlighted events', async () => {
  const campuses = ['sjsu', 'stanford', 'ucsc', 'deanza', 'scu'];
  const events = loadEvents([
    ...campuses.map((campus) => fixture(campus, campus)),
    fixture('church', 'all'),
    fixture('svc', 'svc'),
  ]);
  for (const campus of campuses) {
    assert.deepEqual(ids(await events.getHighlightedEvents(now, campus)), [campus]);
  }
});

test('a campus with no matching upcoming events has no cards', async () => {
  const events = loadEvents([fixture('church', 'all'), fixture('other', 'ucsc')]);
  assert.deepEqual(ids(await events.getHighlightedEvents(now, 'deanza')), []);
  const campusOnly = loadEvents([
    fixture('campus', 'deanza', {
      tier: 'banner',
      banner: { text: 'Synthetic banner fixture', shortText: 'Fixture' },
    }),
  ]);
  assert.deepEqual(ids(await campusOnly.getHighlightedEvents(now)), []);
  assert.equal(await campusOnly.getActiveBannerEvent(now), null);
});

test('campus events remain on their end date and expire the following day', async () => {
  const events = loadEvents([
    fixture('single-day', 'deanza', { date: new Date('2000-01-10') }),
    fixture('multi-day', 'deanza', {
      date: new Date('2000-01-08'),
      endDate: new Date('2000-01-10'),
    }),
  ]);
  assert.deepEqual(ids(await events.getHighlightedEvents(now, 'deanza')), [
    'multi-day',
    'single-day',
  ]);
  assert.deepEqual(
    ids(await events.getHighlightedEvents(new Date('2000-01-11T12:00:00Z'), 'deanza')),
    []
  );
});

test('sitewide banner excludes campus events and preserves lead dates', async () => {
  const banner = { text: 'Synthetic banner fixture', shortText: 'Fixture' };
  const events = loadEvents([
    fixture('campus', 'deanza', { tier: 'banner', banner }),
    fixture('not-yet', 'all', {
      tier: 'banner',
      banner,
      bannerStartsAt: new Date('2000-01-11'),
    }),
    fixture('church', 'svc', { tier: 'banner', banner }),
  ]);
  assert.equal((await events.getActiveBannerEvent(now)).id, 'church');
  assert.equal(await events.getActiveBannerEvent(new Date('2000-01-12T12:00:00Z')), null);
});
