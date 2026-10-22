import type { WordEntry, WordSet } from './types';

export interface WordSetRepository {
  /** Zestawy posortowane po `createdAt` malejąco. */
  listSets(): Promise<WordSet[]>;
  /** Słówka posortowane po `position`. */
  getSet(id: string): Promise<{ set: WordSet; entries: WordEntry[] } | null>;
  /** Jedna transakcja — przy błędzie nic nie zostaje zapisane. */
  createSet(set: WordSet, entries: WordEntry[]): Promise<void>;
  /** `null`, gdy zestaw nie istnieje. Nazwę waliduje wywołujący (`validateSetName`). */
  renameSet(id: string, name: string, now: Date): Promise<WordSet | null>;
  /** Jedna transakcja: zestaw, jego słówka i postęp nauki. */
  deleteSet(id: string): Promise<void>;
}

export type StorageErrorCode = 'QUOTA_EXCEEDED' | 'UNAVAILABLE';

const STORAGE_ERROR_MESSAGES: Record<StorageErrorCode, string> = {
  QUOTA_EXCEEDED: 'Brak miejsca w pamięci przeglądarki. Usuń niepotrzebne zestawy i spróbuj ponownie.',
  UNAVAILABLE: 'Przeglądarka nie pozwala zapisywać danych (np. tryb prywatny). Zestaw nie został zapisany.',
};

export class StorageError extends Error {
  readonly code: StorageErrorCode;

  constructor(code: StorageErrorCode, options?: { cause?: unknown }) {
    super(STORAGE_ERROR_MESSAGES[code], options);
    this.name = 'StorageError';
    this.code = code;
  }
}
