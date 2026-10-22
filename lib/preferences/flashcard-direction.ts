import type { Direction } from '@/lib/flashcards/session';

export const DIRECTION_STORAGE_KEY = 'parleme.flashcardDirection';

const DEFAULT_DIRECTION: Direction = 'it-pl';

export function parseDirection(raw: string | null): Direction {
  return raw === 'it-pl' || raw === 'pl-it' ? raw : DEFAULT_DIRECTION;
}

/** Brak pamięci lub błąd odczytu (np. tryb prywatny) → kierunek domyślny. */
export function loadDirection(storage?: Pick<Storage, 'getItem'>): Direction {
  try {
    return parseDirection(storage?.getItem(DIRECTION_STORAGE_KEY) ?? null);
  } catch {
    return DEFAULT_DIRECTION;
  }
}

export function saveDirection(direction: Direction, storage?: Pick<Storage, 'setItem'>): void {
  try {
    storage?.setItem(DIRECTION_STORAGE_KEY, direction);
  } catch {
    // Ustawienie nie zostanie zapamiętane — sesja działa dalej.
  }
}
