export const LAST_STUDIED_SET_KEY = 'parleme.lastStudiedSetId';

/** Brak pamięci lub błąd odczytu (np. tryb prywatny) → `null`. */
export function loadLastStudiedSetId(storage?: Pick<Storage, 'getItem'>): string | null {
  try {
    return storage?.getItem(LAST_STUDIED_SET_KEY) || null;
  } catch {
    return null;
  }
}

export function saveLastStudiedSetId(id: string, storage?: Pick<Storage, 'setItem'>): void {
  try {
    storage?.setItem(LAST_STUDIED_SET_KEY, id);
  } catch {
    // Wybór nie zostanie zapamiętany — nauka działa dalej.
  }
}

/** Usuwa wpis tylko, jeśli wskazuje usuwany zestaw. */
export function clearLastStudiedSetId(id: string, storage?: Pick<Storage, 'getItem' | 'removeItem'>): void {
  try {
    if (storage?.getItem(LAST_STUDIED_SET_KEY) === id) {
      storage.removeItem(LAST_STUDIED_SET_KEY);
    }
  } catch {
    // Ignorowane — nieaktualny wpis jest pomijany przy odczycie listy.
  }
}
