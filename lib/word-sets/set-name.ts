import { MAX_SET_NAME_LENGTH } from './types';

export type SetNameValidation = { ok: true } | { ok: false; message: string };

export function defaultSetName(fileName: string): string {
  return fileName.trim().replace(/\.csv$/i, '').trim().slice(0, MAX_SET_NAME_LENGTH).trim();
}

export function validateSetName(name: string): SetNameValidation {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: 'Podaj nazwę zestawu.' };
  }
  if (trimmed.length > MAX_SET_NAME_LENGTH) {
    return { ok: false, message: `Nazwa może mieć najwyżej ${MAX_SET_NAME_LENGTH} znaków.` };
  }
  return { ok: true };
}

/** Zwraca `name` albo `name (2)`, `name (3)`… jeśli nazwa jest już zajęta. */
export function suggestUniqueName(name: string, existingNames: string[]): string {
  const base = name.trim();
  const taken = new Set(existingNames.map(normalizeName));
  if (!taken.has(normalizeName(base))) {
    return base;
  }

  for (let n = 2; ; n++) {
    const suffix = ` (${n})`;
    const candidate = base.slice(0, MAX_SET_NAME_LENGTH - suffix.length).trimEnd() + suffix;
    if (!taken.has(normalizeName(candidate))) {
      return candidate;
    }
  }
}

export function isNameTaken(name: string, existingNames: string[]): boolean {
  const normalized = normalizeName(name);
  return existingNames.some((existing) => normalizeName(existing) === normalized);
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('pl');
}
