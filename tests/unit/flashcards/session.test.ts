import { describe, expect, it } from 'vitest';
import {
  cardSides,
  createSession,
  currentCard,
  formatDuration,
  getSessionSummary,
  sessionReducer,
  type FlashcardSession,
  type Rating,
} from '@/lib/flashcards/session';
import type { WordEntry } from '@/lib/word-sets/types';

function makeEntries(count: number): WordEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `e${i}`,
    setId: 's1',
    italian: `parola ${i}`,
    polish: `słowo ${i}`,
    position: i,
  }));
}

function answer(state: FlashcardSession, rating: Rating, now = 0): FlashcardSession {
  const flipped = sessionReducer(state, { type: 'flip' });
  return sessionReducer(flipped, { type: 'rate', rating, now });
}

describe('createSession', () => {
  it('bierze wszystkie słówka małego zestawu w kolejności position', () => {
    const entries = makeEntries(3).reverse();

    const session = createSession('s1', entries, { now: 1000 });

    expect(session.queue).toEqual(['e0', 'e1', 'e2']);
    expect(session.flipped).toBe(false);
    expect(session.knownCount).toBe(0);
    expect(session.startedAt).toBe(1000);
    expect(session.finishedAt).toBeNull();
    expect(session.direction).toBe('it-pl');
  });

  it('z postępem zaczyna od słówek „Nie znam”, opanowane na końcu', () => {
    const entries = makeEntries(4);
    const base = { setId: 's1', lastRatedAt: '2026-10-22T10:00:00.000Z', knownTotal: 1, unknownTotal: 0 };
    const progress = {
      e0: { ...base, entryId: 'e0', lastRating: 'known' as const, knownStreakSessions: 2, mastered: true },
      e2: { ...base, entryId: 'e2', lastRating: 'unknown' as const, knownStreakSessions: 0, mastered: false },
    };

    const session = createSession('s1', entries, { now: 0, progress, random: () => 0 });

    expect(session.queue).toEqual(['e2', 'e1', 'e3', 'e0']);
  });

  it('z postępem nadal ogranicza rundę do 20 kart, wybierając najpierw „Nie znam”', () => {
    const entries = makeEntries(30);
    const progress = {
      e29: {
        entryId: 'e29',
        setId: 's1',
        lastRating: 'unknown' as const,
        lastRatedAt: '2026-10-22T10:00:00.000Z',
        knownStreakSessions: 0,
        mastered: false,
        knownTotal: 0,
        unknownTotal: 1,
      },
    };

    const session = createSession('s1', entries, { now: 0, progress });

    expect(session.cards).toHaveLength(20);
    expect(session.queue[0]).toBe('e29');
  });

  it('ogranicza rundę do 20 kart', () => {
    const session = createSession('s1', makeEntries(2000), { now: 0 });

    expect(session.cards).toHaveLength(20);
    expect(session.queue).toEqual(makeEntries(20).map((e) => e.id));
  });
});

describe('sessionReducer', () => {
  it('flip odwraca bieżącą kartę', () => {
    const session = createSession('s1', makeEntries(2), { now: 0 });

    expect(sessionReducer(session, { type: 'flip' }).flipped).toBe(true);
  });

  it('„Znam” usuwa kartę z kolejki i zwiększa licznik', () => {
    const session = answer(createSession('s1', makeEntries(3), { now: 0 }), 'known');

    expect(session.queue).toEqual(['e1', 'e2']);
    expect(session.knownCount).toBe(1);
    expect(session.flipped).toBe(false);
    expect(currentCard(session)?.id).toBe('e1');
  });

  it('„Nie znam” przenosi kartę za wszystkie jeszcze niepokazane', () => {
    const session = answer(createSession('s1', makeEntries(3), { now: 0 }), 'unknown');

    expect(session.queue).toEqual(['e1', 'e2', 'e0']);
    expect(session.knownCount).toBe(0);
  });

  it('karta wraca, dopóki nie zostanie oceniona „Znam”', () => {
    let session = createSession('s1', makeEntries(1), { now: 0 });
    session = answer(session, 'unknown');
    session = answer(session, 'unknown');

    expect(session.queue).toEqual(['e0']);
    expect(session.finishedAt).toBeNull();

    session = answer(session, 'known', 5000);
    expect(session.queue).toEqual([]);
    expect(session.finishedAt).toBe(5000);
    expect(currentCard(session)).toBeNull();
  });

  it('ignoruje ocenę przed odwróceniem karty', () => {
    const session = createSession('s1', makeEntries(2), { now: 0 });

    expect(sessionReducer(session, { type: 'rate', rating: 'known', now: 0 })).toBe(session);
  });

  it('ignoruje podwójną ocenę tej samej karty', () => {
    const rated = answer(createSession('s1', makeEntries(2), { now: 0 }), 'known');

    expect(sessionReducer(rated, { type: 'rate', rating: 'known', now: 0 })).toBe(rated);
  });

  it('ignoruje flip po zakończeniu rundy', () => {
    const finished = answer(createSession('s1', makeEntries(1), { now: 0 }), 'known');

    expect(sessionReducer(finished, { type: 'flip' })).toBe(finished);
  });

  it('zapamiętuje tylko pierwszą ocenę karty', () => {
    let session = createSession('s1', makeEntries(1), { now: 0 });
    session = answer(session, 'unknown');
    session = answer(session, 'known');

    expect(session.firstRatings).toEqual({ e0: 'unknown' });
  });
});

describe('kierunek fiszek', () => {
  it('createSession przyjmuje kierunek pl-it', () => {
    expect(createSession('s1', makeEntries(2), { now: 0, direction: 'pl-it' }).direction).toBe('pl-it');
  });

  it('setDirection zmienia kierunek i wraca na przód karty, nie ruszając rundy', () => {
    let session = answer(createSession('s1', makeEntries(3), { now: 0 }), 'unknown');
    session = sessionReducer(session, { type: 'flip' });

    const changed = sessionReducer(session, { type: 'setDirection', direction: 'pl-it' });

    expect(changed.direction).toBe('pl-it');
    expect(changed.flipped).toBe(false);
    expect(changed.queue).toEqual(session.queue);
    expect(changed.firstRatings).toEqual(session.firstRatings);
    expect(changed.knownCount).toBe(session.knownCount);
  });

  it('ten sam kierunek albo zakończona runda → ten sam obiekt stanu', () => {
    const session = createSession('s1', makeEntries(1), { now: 0 });
    expect(sessionReducer(session, { type: 'setDirection', direction: 'it-pl' })).toBe(session);

    const finished = answer(session, 'known');
    expect(sessionReducer(finished, { type: 'setDirection', direction: 'pl-it' })).toBe(finished);
  });
});

describe('getSessionSummary', () => {
  it('18 kart, 3 × „Nie znam” → 15 znanych od razu, 3 powtórzone', () => {
    const entries = makeEntries(18);
    const unknownIds = new Set(['e2', 'e7', 'e11']);
    let session = createSession('s1', entries, { now: 1000 });

    let now = 1000;
    while (currentCard(session)) {
      const card = currentCard(session)!;
      const firstTime = session.firstRatings[card.id] === undefined;
      now += 4000;
      session = answer(session, firstTime && unknownIds.has(card.id) ? 'unknown' : 'known', now);
    }

    const summary = getSessionSummary(session);
    expect(summary.knownFirstTry).toBe(15);
    expect(summary.repeated.map((e) => e.id)).toEqual(['e2', 'e7', 'e11']);
    expect(summary.durationMs).toBe(21 * 4000);
  });
});

describe('cardSides', () => {
  const card = makeEntries(1)[0];

  it('it-pl: przód po włosku', () => {
    expect(cardSides(card, 'it-pl')).toEqual({
      front: 'parola 0',
      back: 'słowo 0',
      frontLang: 'it',
      backLang: 'pl',
    });
  });

  it('pl-it: przód po polsku', () => {
    expect(cardSides(card, 'pl-it')).toEqual({
      front: 'słowo 0',
      back: 'parola 0',
      frontLang: 'pl',
      backLang: 'it',
    });
  });
});

describe('formatDuration', () => {
  it.each([
    [42000, '0:42'],
    [65000, '1:05'],
    [600000, '10:00'],
    [1499, '0:01'],
  ])('%i ms → %s', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});
