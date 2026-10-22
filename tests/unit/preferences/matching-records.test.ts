import { describe, expect, it } from 'vitest';
import {
  MATCHING_RECORDS_KEY,
  clearMatchingRecord,
  isNewRecord,
  loadMatchingRecords,
  submitMatchingResult,
} from '@/lib/preferences/matching-records';

function memoryStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(MATCHING_RECORDS_KEY, initial);
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    data,
  };
}

const brokenStorage = {
  getItem: (): string | null => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

const now = new Date('2026-10-22T10:00:00.000Z');

describe('isNewRecord', () => {
  it('nowy rekord tylko przy braku rekordu albo ściśle krótszym czasie', () => {
    expect(isNewRecord(null, 5000)).toBe(true);
    expect(isNewRecord(5000, 4999)).toBe(true);
    expect(isNewRecord(5000, 5000)).toBe(false);
    expect(isNewRecord(5000, 6000)).toBe(false);
  });
});

describe('submitMatchingResult', () => {
  it('pierwszy wynik zestawu zostaje rekordem', () => {
    const storage = memoryStorage();

    expect(submitMatchingResult('s1', 20000, now, storage)).toEqual({
      isNewRecord: true,
      previousBestMs: null,
      bestMs: 20000,
    });
    expect(MATCHING_RECORDS_KEY).toBe('parleme.matchingRecords');
    expect(loadMatchingRecords(storage)).toEqual({ s1: { bestMs: 20000, achievedAt: now.toISOString() } });
  });

  it('wolniejszy wynik nie zmienia rekordu, szybszy go zastępuje', () => {
    const storage = memoryStorage();
    submitMatchingResult('s1', 20000, now, storage);

    expect(submitMatchingResult('s1', 25300, now, storage)).toEqual({
      isNewRecord: false,
      previousBestMs: 20000,
      bestMs: 20000,
    });

    const later = new Date('2026-10-23T10:00:00.000Z');
    expect(submitMatchingResult('s1', 18000, later, storage)).toEqual({
      isNewRecord: true,
      previousBestMs: 20000,
      bestMs: 18000,
    });
    expect(loadMatchingRecords(storage).s1).toEqual({ bestMs: 18000, achievedAt: later.toISOString() });
  });

  it('rekordy zestawów są niezależne, clear usuwa tylko wskazany', () => {
    const storage = memoryStorage();
    submitMatchingResult('s1', 20000, now, storage);
    submitMatchingResult('s2', 30000, now, storage);

    clearMatchingRecord('s1', storage);

    expect(Object.keys(loadMatchingRecords(storage))).toEqual(['s2']);
  });
});

describe('odporność na błędy', () => {
  it('pomija uszkodzone dane', () => {
    expect(loadMatchingRecords(memoryStorage('{nie json'))).toEqual({});
    expect(loadMatchingRecords(memoryStorage('[1]'))).toEqual({});
    expect(
      loadMatchingRecords(memoryStorage('{"a":{"bestMs":"x"},"b":5,"c":{"bestMs":1000,"achievedAt":"t"}}')),
    ).toEqual({ c: { bestMs: 1000, achievedAt: 't' } });
  });

  it('bez pamięci lub przy błędzie nie rzuca', () => {
    expect(loadMatchingRecords(undefined)).toEqual({});
    expect(loadMatchingRecords(brokenStorage)).toEqual({});
    expect(submitMatchingResult('s1', 1000, now, brokenStorage)).toEqual({
      isNewRecord: true,
      previousBestMs: null,
      bestMs: 1000,
    });
    expect(() => clearMatchingRecord('s1', brokenStorage)).not.toThrow();
  });
});
