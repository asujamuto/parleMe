import { describe, expect, it } from 'vitest';
import {
  LAST_STUDIED_SET_KEY,
  clearLastStudiedSetId,
  loadLastStudiedSetId,
  saveLastStudiedSetId,
} from '@/lib/preferences/last-studied-set';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
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
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

describe('ostatnio uczony zestaw', () => {
  it('zapisuje i odczytuje id pod stałym kluczem', () => {
    const storage = memoryStorage();

    saveLastStudiedSetId('s1', storage);

    expect(LAST_STUDIED_SET_KEY).toBe('parleme.lastStudiedSetId');
    expect(storage.data.get(LAST_STUDIED_SET_KEY)).toBe('s1');
    expect(loadLastStudiedSetId(storage)).toBe('s1');
  });

  it('bez pamięci lub przy błędzie zwraca null i nie rzuca', () => {
    expect(loadLastStudiedSetId(undefined)).toBeNull();
    expect(loadLastStudiedSetId(brokenStorage)).toBeNull();
    expect(() => saveLastStudiedSetId('s1', brokenStorage)).not.toThrow();
    expect(() => clearLastStudiedSetId('s1', brokenStorage)).not.toThrow();
  });

  it('clear usuwa wpis tylko dla wskazanego zestawu', () => {
    const storage = memoryStorage();
    saveLastStudiedSetId('a', storage);

    clearLastStudiedSetId('b', storage);
    expect(loadLastStudiedSetId(storage)).toBe('a');

    clearLastStudiedSetId('a', storage);
    expect(loadLastStudiedSetId(storage)).toBeNull();
  });
});
