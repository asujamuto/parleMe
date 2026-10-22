import { isQuotaExceeded, openParleMeDb } from '@/lib/storage/db';
import { StorageError } from '@/lib/word-sets/repository';
import type { WordProgress } from './types';

export interface ProgressRepository {
  listBySet(setId: string): Promise<WordProgress[]>;
  /** Wywoływane przy każdej ocenie (FR-011). */
  save(progress: WordProgress): Promise<void>;
  masteredCountsBySet(): Promise<Record<string, number>>;
  /** Dla usuwania zestawu (FR-015). */
  deleteBySet(setId: string): Promise<void>;
}

export function createIndexedDbProgressRepository(dbName = 'parleme'): ProgressRepository {
  const getDb = () => openParleMeDb(dbName);

  return {
    async listBySet(setId) {
      const db = await getDb();
      return db.getAllFromIndex('wordProgress', 'setId', setId);
    },

    async save(progress) {
      const db = await getDb();
      try {
        await db.put('wordProgress', progress);
      } catch (error) {
        if (isQuotaExceeded(error)) {
          throw new StorageError('QUOTA_EXCEEDED', { cause: error });
        }
        throw error;
      }
    },

    async masteredCountsBySet() {
      const db = await getDb();
      const counts: Record<string, number> = {};
      for (const progress of await db.getAll('wordProgress')) {
        if (progress.mastered) counts[progress.setId] = (counts[progress.setId] ?? 0) + 1;
      }
      return counts;
    },

    async deleteBySet(setId) {
      const db = await getDb();
      const tx = db.transaction('wordProgress', 'readwrite');
      const keys = await tx.store.index('setId').getAllKeys(setId);
      await Promise.all([...keys.map((key) => tx.store.delete(key)), tx.done]);
    },
  };
}
