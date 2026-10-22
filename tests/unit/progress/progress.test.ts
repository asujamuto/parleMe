import { describe, expect, it } from 'vitest';
import { applyRating, countMastered, orderEntriesForSession } from '@/lib/progress/progress';
import type { WordProgress } from '@/lib/progress/types';
import type { WordEntry } from '@/lib/word-sets/types';

const now = new Date('2026-10-22T10:00:00.000Z');

function rate(previous: WordProgress | undefined, rating: 'known' | 'unknown', firstInSession = true) {
  return applyRating(previous, { entryId: 'e1', setId: 's1', rating, firstInSession, now });
}

function makeEntries(count: number): WordEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `e${i}`,
    setId: 's1',
    italian: `parola ${i}`,
    polish: `słowo ${i}`,
    position: i,
  }));
}

function progressFor(entryId: string, overrides: Partial<WordProgress>): WordProgress {
  return {
    entryId,
    setId: 's1',
    lastRating: 'known',
    lastRatedAt: now.toISOString(),
    knownStreakSessions: 1,
    mastered: false,
    knownTotal: 1,
    unknownTotal: 0,
    ...overrides,
  };
}

describe('applyRating', () => {
  it('tworzy postęp dla słówka bez historii', () => {
    expect(rate(undefined, 'known')).toEqual({
      entryId: 'e1',
      setId: 's1',
      lastRating: 'known',
      lastRatedAt: '2026-10-22T10:00:00.000Z',
      knownStreakSessions: 1,
      mastered: false,
      knownTotal: 1,
      unknownTotal: 0,
    });
  });

  it('dwie kolejne sesje ze „Znam” przy pierwszym pokazaniu → opanowane', () => {
    const progress = rate(rate(undefined, 'known'), 'known');

    expect(progress.knownStreakSessions).toBe(2);
    expect(progress.mastered).toBe(true);
  });

  it('„Nie znam” przy pierwszym pokazaniu zeruje serię i odbiera opanowanie', () => {
    const mastered = rate(rate(undefined, 'known'), 'known');

    const progress = rate(mastered, 'unknown');

    expect(progress.knownStreakSessions).toBe(0);
    expect(progress.mastered).toBe(false);
    expect(progress.lastRating).toBe('unknown');
    expect(progress.unknownTotal).toBe(1);
  });

  it('ocena powtórki w tej samej sesji nie zmienia serii', () => {
    const afterUnknown = rate(undefined, 'unknown');

    const progress = rate(afterUnknown, 'known', false);

    expect(progress.knownStreakSessions).toBe(0);
    expect(progress.mastered).toBe(false);
    expect(progress.lastRating).toBe('known');
    expect(progress.knownTotal).toBe(1);
    expect(progress.unknownTotal).toBe(1);
  });
});

describe('orderEntriesForSession', () => {
  it('kolejność grup: „Nie znam” → nowe (wg position) → znane → opanowane', () => {
    const entries = makeEntries(8);
    const progress = {
      e0: progressFor('e0', { mastered: true, knownStreakSessions: 2 }),
      e1: progressFor('e1', {}),
      e3: progressFor('e3', { lastRating: 'unknown', knownStreakSessions: 0 }),
      e5: progressFor('e5', { lastRating: 'unknown', knownStreakSessions: 0 }),
      e6: progressFor('e6', {}),
    };

    const ordered = orderEntriesForSession(entries, progress, () => 0).map((e) => e.id);

    expect(new Set(ordered.slice(0, 2))).toEqual(new Set(['e3', 'e5']));
    expect(ordered.slice(2, 5)).toEqual(['e2', 'e4', 'e7']);
    expect(new Set(ordered.slice(5, 7))).toEqual(new Set(['e1', 'e6']));
    expect(ordered[7]).toBe('e0');
  });

  it('bez postępu zachowuje kolejność z pliku', () => {
    const entries = makeEntries(5).reverse();

    expect(orderEntriesForSession(entries, {}).map((e) => e.id)).toEqual(['e0', 'e1', 'e2', 'e3', 'e4']);
  });

  it('miesza karty w obrębie grupy za pomocą random', () => {
    const entries = makeEntries(4);
    const progress = Object.fromEntries(
      entries.map((e) => [e.id, progressFor(e.id, { lastRating: 'unknown', knownStreakSessions: 0 })]),
    );
    const values = [0.9, 0.1, 0.5];
    let i = 0;

    const ordered = orderEntriesForSession(entries, progress, () => values[i++ % values.length]);

    expect(new Set(ordered.map((e) => e.id))).toEqual(new Set(['e0', 'e1', 'e2', 'e3']));
    expect(ordered.map((e) => e.id)).not.toEqual(['e0', 'e1', 'e2', 'e3']);
  });
});

describe('countMastered', () => {
  it('liczy opanowane słówka', () => {
    expect(
      countMastered([
        progressFor('a', { mastered: true }),
        progressFor('b', { mastered: false }),
        progressFor('c', { mastered: true }),
      ]),
    ).toBe(2);
  });
});

describe('applyRating dla wyników dopasowywania (004 US3)', () => {
  it('„Nie znam” jako pierwsza ocena odbiera opanowanie', () => {
    const mastered = progressFor('e1', { mastered: true, knownStreakSessions: 2 });

    const progress = applyRating(mastered, { entryId: 'e1', setId: 's1', rating: 'unknown', firstInSession: true, now });

    expect(progress.mastered).toBe(false);
    expect(progress.knownStreakSessions).toBe(0);
  });

  it('„Znam” jako powtórka nie zmienia serii ani opanowania', () => {
    const learning = progressFor('e1', { knownStreakSessions: 1, mastered: false });

    const progress = applyRating(learning, { entryId: 'e1', setId: 's1', rating: 'known', firstInSession: false, now });

    expect(progress.knownStreakSessions).toBe(1);
    expect(progress.mastered).toBe(false);
    expect(progress.lastRating).toBe('known');
  });
});
