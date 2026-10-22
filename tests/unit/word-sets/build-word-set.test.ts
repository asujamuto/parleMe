import { describe, expect, it } from 'vitest';
import { buildWordSet } from '@/lib/word-sets/build-word-set';

function sequentialIds() {
  let i = 0;
  return () => `id-${++i}`;
}

describe('buildWordSet', () => {
  const now = new Date('2026-10-22T10:00:00.000Z');
  const pairs = [
    { italian: 'ciao', polish: 'cześć', line: 2 },
    { italian: 'grazie', polish: 'dziękuję', line: 4 },
  ];

  it('tworzy zestaw ze źródłem csv i licznikiem słówek', () => {
    const { set } = buildWordSet({ name: '  Lekcja 1 ', pairs, fileName: 'lekcja.csv', now, newId: sequentialIds() });

    expect(set).toEqual({
      id: 'id-1',
      name: 'Lekcja 1',
      source: 'csv',
      sourceFileName: 'lekcja.csv',
      entryCount: 2,
      createdAt: '2026-10-22T10:00:00.000Z',
      updatedAt: '2026-10-22T10:00:00.000Z',
    });
  });

  it('przekazuje źródło sample, domyślnie csv', () => {
    expect(buildWordSet({ name: 'A', pairs, fileName: null, now, newId: sequentialIds(), source: 'sample' }).set.source).toBe(
      'sample',
    );
    expect(buildWordSet({ name: 'A', pairs, fileName: null, now, newId: sequentialIds() }).set.source).toBe('csv');
  });

  it('tworzy słówka z unikalnymi id i pozycją od 0', () => {
    const { set, entries } = buildWordSet({ name: 'A', pairs, fileName: null, now, newId: sequentialIds() });

    expect(entries).toEqual([
      { id: 'id-2', setId: set.id, italian: 'ciao', polish: 'cześć', position: 0 },
      { id: 'id-3', setId: set.id, italian: 'grazie', polish: 'dziękuję', position: 1 },
    ]);
  });
});
