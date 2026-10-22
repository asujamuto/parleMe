import { describe, expect, it } from 'vitest';
import {
  DIRECTION_STORAGE_KEY,
  loadDirection,
  parseDirection,
  saveDirection,
} from '@/lib/preferences/flashcard-direction';

function memoryStorage() {
  const data = new Map<string, string>();
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

describe('parseDirection', () => {
  it('przyjmuje znane kierunki', () => {
    expect(parseDirection('pl-it')).toBe('pl-it');
    expect(parseDirection('it-pl')).toBe('it-pl');
  });

  it('dla braku lub nieznanej wartości zwraca it-pl', () => {
    expect(parseDirection(null)).toBe('it-pl');
    expect(parseDirection('xx')).toBe('it-pl');
  });
});

describe('loadDirection / saveDirection', () => {
  it('zapisuje i odczytuje kierunek pod stałym kluczem', () => {
    const storage = memoryStorage();

    saveDirection('pl-it', storage);

    expect(storage.data.get(DIRECTION_STORAGE_KEY)).toBe('pl-it');
    expect(DIRECTION_STORAGE_KEY).toBe('parleme.flashcardDirection');
    expect(loadDirection(storage)).toBe('pl-it');
  });

  it('bez pamięci zwraca it-pl', () => {
    expect(loadDirection(undefined)).toBe('it-pl');
    expect(() => saveDirection('pl-it', undefined)).not.toThrow();
  });

  it('nie rzuca, gdy pamięć jest niedostępna', () => {
    expect(loadDirection(brokenStorage)).toBe('it-pl');
    expect(() => saveDirection('pl-it', brokenStorage)).not.toThrow();
  });
});
