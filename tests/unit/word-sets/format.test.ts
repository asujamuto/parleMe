import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatWordCount, newId } from '@/lib/word-sets/format';

describe('formatWordCount', () => {
  it.each([
    [0, '0 słówek'],
    [1, '1 słówko'],
    [2, '2 słówka'],
    [4, '4 słówka'],
    [5, '5 słówek'],
    [12, '12 słówek'],
    [14, '14 słówek'],
    [18, '18 słówek'],
    [22, '22 słówka'],
    [112, '112 słówek'],
    [1003, '1003 słówka'],
  ])('%i → %s', (count, expected) => {
    expect(formatWordCount(count)).toBe(expected);
  });
});

describe('newId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  it('zwraca UUID v4', () => {
    expect(newId()).toMatch(uuidV4);
  });

  it('działa bez crypto.randomUUID (strona otwarta przez http)', () => {
    vi.stubGlobal('crypto', { getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto) });

    const ids = new Set(Array.from({ length: 100 }, () => newId()));

    expect(ids.size).toBe(100);
    ids.forEach((id) => expect(id).toMatch(uuidV4));
  });
});
