import { describe, expect, it } from 'vitest';
import { defaultSetName, isNameTaken, suggestUniqueName, validateSetName } from '@/lib/word-sets/set-name';

describe('isNameTaken', () => {
  it('wykrywa zajętą nazwę bez rozróżniania wielkości liter i spacji', () => {
    expect(isNameTaken(' lekcja 1 ', ['Lekcja 1'])).toBe(true);
    expect(isNameTaken('Lekcja 2', ['Lekcja 1'])).toBe(false);
  });
});

describe('defaultSetName', () => {
  it('usuwa rozszerzenie i spacje', () => {
    expect(defaultSetName('ITA5(Zwierzęta).csv')).toBe('ITA5(Zwierzęta)');
    expect(defaultSetName('  lekcja 1 .CSV')).toBe('lekcja 1');
  });

  it('zostawia nazwę bez rozszerzenia', () => {
    expect(defaultSetName('słówka')).toBe('słówka');
  });

  it('przycina do 60 znaków', () => {
    expect(defaultSetName('a'.repeat(80) + '.csv')).toBe('a'.repeat(60));
  });
});

describe('validateSetName', () => {
  it('akceptuje 1–60 znaków po trim', () => {
    expect(validateSetName(' A ')).toEqual({ ok: true });
    expect(validateSetName('a'.repeat(60))).toEqual({ ok: true });
  });

  it('odrzuca pustą nazwę', () => {
    const result = validateSetName('   ');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe('Podaj nazwę zestawu.');
  });

  it('odrzuca nazwę dłuższą niż 60 znaków', () => {
    const result = validateSetName('a'.repeat(61));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe('Nazwa może mieć najwyżej 60 znaków.');
  });
});

describe('suggestUniqueName', () => {
  it('zwraca nazwę bez zmian, gdy nie ma kolizji', () => {
    expect(suggestUniqueName('A', ['B'])).toBe('A');
  });

  it('dodaje kolejny wolny numer', () => {
    expect(suggestUniqueName('A', ['A'])).toBe('A (2)');
    expect(suggestUniqueName('A', ['A', 'A (2)'])).toBe('A (3)');
  });

  it('porównuje bez rozróżniania wielkości liter i spacji', () => {
    expect(suggestUniqueName(' lekcja ', ['Lekcja'])).toBe('lekcja (2)');
  });

  it('mieści się w 60 znakach', () => {
    const long = 'a'.repeat(60);
    const suggestion = suggestUniqueName(long, [long]);
    expect(suggestion).toHaveLength(60);
    expect(suggestion.endsWith(' (2)')).toBe(true);
  });
});
