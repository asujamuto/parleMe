import { isQuotaExceeded, openParleMeDb } from '@/lib/storage/db';
import { StorageError, type WordSetRepository } from './repository';

export function createIndexedDbRepository(dbName = 'parleme'): WordSetRepository {
  const getDb = () => openParleMeDb(dbName);

  return {
    async listSets() {
      const db = await getDb();
      const sets = await db.getAllFromIndex('wordSets', 'createdAt');
      return sets.reverse();
    },

    async getSet(id) {
      const db = await getDb();
      const tx = db.transaction(['wordSets', 'wordEntries'], 'readonly');
      const [set, entries] = await Promise.all([
        tx.objectStore('wordSets').get(id),
        tx.objectStore('wordEntries').index('setId').getAll(id),
        tx.done,
      ]);
      if (!set) return null;
      return { set, entries: entries.sort((a, b) => a.position - b.position) };
    },

    async createSet(set, entries) {
      const db = await getDb();
      const tx = db.transaction(['wordSets', 'wordEntries'], 'readwrite');
      const entryStore = tx.objectStore('wordEntries');
      try {
        await Promise.all([
          tx.objectStore('wordSets').add(set),
          ...entries.map((entry) => entryStore.add(entry)),
          tx.done,
        ]);
      } catch (error) {
        if (isQuotaExceeded(error)) {
          throw new StorageError('QUOTA_EXCEEDED', { cause: error });
        }
        throw error;
      }
    },

    async renameSet(id, name, now) {
      const db = await getDb();
      const tx = db.transaction('wordSets', 'readwrite');
      const set = await tx.store.get(id);
      if (!set) {
        await tx.done;
        return null;
      }
      const renamed = { ...set, name: name.trim(), updatedAt: now.toISOString() };
      await Promise.all([tx.store.put(renamed), tx.done]);
      return renamed;
    },

    async deleteSet(id) {
      const db = await getDb();
      const tx = db.transaction(['wordSets', 'wordEntries', 'wordProgress'], 'readwrite');
      const entryStore = tx.objectStore('wordEntries');
      const progressStore = tx.objectStore('wordProgress');
      const [entryKeys, progressKeys] = await Promise.all([
        entryStore.index('setId').getAllKeys(id),
        progressStore.index('setId').getAllKeys(id),
      ]);
      await Promise.all([
        tx.objectStore('wordSets').delete(id),
        ...entryKeys.map((key) => entryStore.delete(key)),
        ...progressKeys.map((key) => progressStore.delete(key)),
        tx.done,
      ]);
    },
  };
}
