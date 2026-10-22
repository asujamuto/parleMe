import { describe, expect, it } from 'vitest';
import { STUDY_MODES, getTileState, modeHref, type StudyMode } from '@/lib/modes/catalog';

describe('STUDY_MODES', () => {
  it('ma 4 tryby w stałej kolejności', () => {
    expect(STUDY_MODES.map((mode) => mode.id)).toEqual(['flashcards', 'word-tower', 'matching', 'grammar-runner']);
  });

  it('dostępne są tylko fiszki', () => {
    expect(STUDY_MODES.filter((mode) => mode.status === 'available').map((mode) => mode.id)).toEqual(['flashcards']);
  });

  it('minimalne liczby słówek', () => {
    expect(Object.fromEntries(STUDY_MODES.map((mode) => [mode.id, mode.minWords]))).toEqual({
      flashcards: 1,
      'word-tower': 4,
      matching: 4,
      'grammar-runner': 4,
    });
  });

  it('każdy tryb ma nazwę i opis po polsku', () => {
    for (const mode of STUDY_MODES) {
      expect(mode.name.length).toBeGreaterThan(0);
      expect(mode.description.length).toBeGreaterThan(0);
    }
  });
});

describe('getTileState', () => {
  const available: StudyMode = { id: 'matching', name: 'Test', description: 'Test', status: 'available', minWords: 4 };

  it('tryb „wkrótce” niezależnie od liczby słówek', () => {
    const comingSoon = STUDY_MODES.find((mode) => mode.id === 'word-tower')!;
    expect(getTileState(comingSoon, 100)).toBe('coming-soon');
    expect(getTileState(comingSoon, 0)).toBe('coming-soon');
  });

  it('za mało słówek dla dostępnego trybu', () => {
    expect(getTileState(available, 3)).toBe('too-few-words');
  });

  it('dostępny przy wystarczającej liczbie słówek', () => {
    expect(getTileState(available, 4)).toBe('available');
    expect(getTileState(STUDY_MODES[0], 1)).toBe('available');
  });
});

describe('modeHref', () => {
  it('adres fiszek z zakodowanym id zestawu', () => {
    expect(modeHref('flashcards', 'a b')).toBe('/flashcards?set=a%20b');
  });

  it('tryby bez trasy → null', () => {
    expect(modeHref('word-tower', 's1')).toBeNull();
    expect(modeHref('matching', 's1')).toBeNull();
    expect(modeHref('grammar-runner', 's1')).toBeNull();
  });
});
