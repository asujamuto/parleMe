import { describe, expect, it } from 'vitest';
import {
  createBoard,
  createMatchingState,
  elapsedMs,
  formatSeconds,
  matchingReducer,
  roundResult,
  selectPairs,
  type MatchingState,
} from '@/lib/matching/game';
import type { WordProgress } from '@/lib/progress/types';
import type { WordEntry } from '@/lib/word-sets/types';

function entry(id: string, italian: string, polish: string, position = 0): WordEntry {
  return { id, setId: 's1', italian, polish, position };
}

function makeEntries(count: number): WordEntry[] {
  return Array.from({ length: count }, (_, i) => entry(`e${i}`, `parola ${i}`, `słowo ${i}`, i));
}

const noShuffle = () => 0.999;

function select(state: MatchingState, tileId: string, now = 0) {
  return matchingReducer(state, { type: 'select', tileId, now });
}

describe('selectPairs', () => {
  it('wybiera najwyżej 6 par', () => {
    expect(selectPairs(makeEntries(18))).toHaveLength(6);
  });

  it('w małym zestawie bierze wszystkie słówka', () => {
    expect(selectPairs(makeEntries(4))).toHaveLength(4);
    expect(selectPairs(makeEntries(5))).toHaveLength(5);
  });

  it('pomija pary z powtarzającym się tekstem włoskim lub polskim', () => {
    const entries = [
      entry('a', 'prego', 'proszę'),
      entry('b', 'per favore', ' Proszę '),
      entry('c', 'ciao', 'cześć'),
      entry('d', 'Ciao', 'hej'),
    ];

    const pairs = selectPairs(entries, { random: noShuffle });

    expect(pairs.map((p) => p.id)).toEqual(['a', 'c']);
  });

  it('jest deterministyczne przy wstrzykniętym random', () => {
    const random = () => 0.3;
    expect(selectPairs(makeEntries(10), { random })).toEqual(selectPairs(makeEntries(10), { random }));
  });
});

describe('createBoard', () => {
  it('tworzy 2 kafelki na parę', () => {
    const tiles = createBoard([entry('a', 'ciao', 'cześć')], noShuffle);

    expect(tiles).toHaveLength(2);
    expect(tiles).toEqual(
      expect.arrayContaining([
        { id: 'a:it', entryId: 'a', lang: 'it', text: 'ciao' },
        { id: 'a:pl', entryId: 'a', lang: 'pl', text: 'cześć' },
      ]),
    );
  });
});

describe('matchingReducer', () => {
  const pairs = [entry('a', 'ciao', 'cześć'), entry('b', 'grazie', 'dziękuję')];
  const start = () => createMatchingState(pairs, { now: 1000, random: noShuffle });

  it('zaznacza i odznacza kafelek', () => {
    const selected = select(start(), 'a:it');
    expect(selected.selectedTileId).toBe('a:it');

    expect(select(selected, 'a:it').selectedTileId).toBeNull();
  });

  it('kafelek w tym samym języku przenosi zaznaczenie bez kary', () => {
    const state = select(select(start(), 'a:it'), 'b:it');

    expect(state.selectedTileId).toBe('b:it');
    expect(state.mistakes).toBe(0);
  });

  it('odpowiednik dopasowuje parę', () => {
    const state = select(select(start(), 'a:it'), 'a:pl');

    expect(state.matchedEntryIds).toEqual(['a']);
    expect(state.selectedTileId).toBeNull();
    expect(state.finishedAt).toBeNull();
  });

  it('błędna para dolicza błąd i zapamiętuje oba słówka', () => {
    let state = select(select(start(), 'a:it'), 'b:pl');
    state = select(select(state, 'b:pl'), 'a:it');

    expect(state.mistakes).toBe(2);
    expect(state.errorEntryIds.sort()).toEqual(['a', 'b']);
    expect(state.wrongTileIds).toEqual(['b:pl', 'a:it']);
    expect(state.selectedTileId).toBeNull();
  });

  it('clearFeedback czyści sygnalizację błędu', () => {
    const wrong = select(select(start(), 'a:it'), 'b:pl');

    expect(matchingReducer(wrong, { type: 'clearFeedback' }).wrongTileIds).toBeNull();
  });

  it('ostatnia para kończy rundę', () => {
    let state = select(select(start(), 'a:it'), 'a:pl', 2000);
    state = select(select(state, 'b:pl', 3000), 'b:it', 4000);

    expect(state.finishedAt).toBe(4000);
  });

  it('ignoruje kliknięcia w dopasowane kafelki i po zakończeniu', () => {
    const matched = select(select(start(), 'a:it'), 'a:pl');
    expect(select(matched, 'a:it')).toBe(matched);

    const finished = select(select(matched, 'b:it'), 'b:pl');
    expect(select(finished, 'b:it')).toBe(finished);
  });
});

describe('elapsedMs i formatSeconds', () => {
  it('dolicza 1 s za każdy błąd i zatrzymuje się po zakończeniu', () => {
    const pairs = [entry('a', 'ciao', 'cześć'), entry('b', 'grazie', 'dziękuję')];
    let state = createMatchingState(pairs, { now: 1000, random: noShuffle });
    state = select(select(state, 'a:it'), 'b:pl');

    expect(elapsedMs(state, 6000)).toBe(6000);

    state = select(select(state, 'a:it'), 'a:pl');
    state = select(select(state, 'b:it'), 'b:pl', 9000);
    expect(elapsedMs(state, 20000)).toBe(9000);
  });

  it('formatuje czas z przecinkiem dziesiętnym', () => {
    expect(formatSeconds(12340)).toBe('12,3 s');
    expect(formatSeconds(0)).toBe('0,0 s');
  });
});

function progressFor(entryId: string, lastRating: 'known' | 'unknown'): WordProgress {
  return {
    entryId,
    setId: 's1',
    lastRating,
    lastRatedAt: '2026-10-22T10:00:00.000Z',
    knownStreakSessions: lastRating === 'known' ? 1 : 0,
    mastered: false,
    knownTotal: 1,
    unknownTotal: 0,
  };
}

describe('selectPairs z postępem (US3)', () => {
  it('najpierw słówka ostatnio „Nie znam”', () => {
    const entries = makeEntries(12);
    const progress = { e9: progressFor('e9', 'unknown'), e11: progressFor('e11', 'unknown'), e0: progressFor('e0', 'known') };

    const pairs = selectPairs(entries, { progress, random: noShuffle });

    expect(pairs).toHaveLength(6);
    expect(new Set(pairs.slice(0, 2).map((p) => p.id))).toEqual(new Set(['e9', 'e11']));
    expect(pairs.map((p) => p.id)).not.toContain('e0');
  });

  it('nadal pomija powtórzenia tekstu', () => {
    const entries = [entry('a', 'prego', 'proszę'), entry('b', 'per favore', 'proszę'), entry('c', 'ciao', 'cześć')];
    const progress = { b: progressFor('b', 'unknown') };

    expect(selectPairs(entries, { progress, random: noShuffle }).map((p) => p.id)).toEqual(['b', 'c']);
  });
});

describe('roundResult (US3)', () => {
  it('słówka z błędem → „Nie znam” jak pierwsza ocena, bezbłędne → „Znam” bez zmiany serii', () => {
    const pairs = [entry('a', 'ciao', 'cześć'), entry('b', 'grazie', 'dziękuję'), entry('c', 'prego', 'proszę')];
    let state = createMatchingState(pairs, { now: 1000, random: noShuffle });
    state = select(select(state, 'a:it'), 'b:pl');
    for (const id of ['a', 'b', 'c']) state = select(select(state, `${id}:it`), `${id}:pl`, 5000);

    const result = roundResult(state);

    expect(result.timeMs).toBe(elapsedMs(state, 5000));
    expect(result.ratings).toEqual([
      { entryId: 'a', rating: 'unknown', firstInSession: true },
      { entryId: 'b', rating: 'unknown', firstInSession: true },
      { entryId: 'c', rating: 'known', firstInSession: false },
    ]);
  });
});
