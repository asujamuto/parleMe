import { describe, expect, it } from 'vitest';
import { LAST_MODE_KEY, clearLastMode, loadLastModes, saveLastMode } from '@/lib/preferences/last-mode';

function memoryStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(LAST_MODE_KEY, initial);
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

describe('ostatni tryb zestawu', () => {
  it('zapisuje tryb osobno dla każdego zestawu', () => {
    const storage = memoryStorage();

    saveLastMode('s1', 'flashcards', storage);
    saveLastMode('s2', 'matching', storage);

    expect(LAST_MODE_KEY).toBe('parleme.lastModeBySet');
    expect(loadLastModes(storage)).toEqual({ s1: 'flashcards', s2: 'matching' });
  });

  it('clearLastMode usuwa tylko wskazany zestaw', () => {
    const storage = memoryStorage();
    saveLastMode('s1', 'flashcards', storage);
    saveLastMode('s2', 'flashcards', storage);

    clearLastMode('s1', storage);

    expect(loadLastModes(storage)).toEqual({ s2: 'flashcards' });
  });

  it('pomija uszkodzone dane i nieznane tryby', () => {
    expect(loadLastModes(memoryStorage('{nie json'))).toEqual({});
    expect(loadLastModes(memoryStorage('[1,2]'))).toEqual({});
    expect(loadLastModes(memoryStorage('{"s1":"flashcards","s2":"xx","s3":5}'))).toEqual({ s1: 'flashcards' });
  });

  it('bez pamięci lub przy błędzie nie rzuca', () => {
    expect(loadLastModes(undefined)).toEqual({});
    expect(loadLastModes(brokenStorage)).toEqual({});
    expect(() => saveLastMode('s1', 'flashcards', brokenStorage)).not.toThrow();
    expect(() => clearLastMode('s1', brokenStorage)).not.toThrow();
  });
});
