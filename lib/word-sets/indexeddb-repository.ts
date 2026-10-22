import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { StorageError, type WordSetRepository } from './repository';
import type { WordEntry, WordSet } from './types';

const DB_VERSION = 1;

interface ParleMeDB extends DBSchema {
  wordSets: {
    key: string;
    value: WordSet;
    indexes: { createdAt: string };
  };
  wordEntries: {
    key: string;
    value: WordEntry;
    indexes: { setId: string };
  };
}

export function createIndexedDbRepository(dbName = 'parleme'): WordSetRepository {
  let dbPromise: Promise<IDBPDatabase<ParleMeDB>> | null = null;

  function getDb() {
    dbPromise ??= openDB<ParleMeDB>(dbName, DB_VERSION, {
      upgrade(db) {
        const sets = db.createObjectStore('wordSets', { keyPath: 'id' });
        sets.createIndex('createdAt', 'createdAt');
        const entries = db.createObjectStore('wordEntries', { keyPath: 'id' });
        entries.createIndex('setId', 'setId');
      },
    }).catch((error: unknown) => {
      dbPromise = null;
      throw new StorageError('UNAVAILABLE', { cause: error });
    });
    return dbPromise;
  }

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
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          throw new StorageError('QUOTA_EXCEEDED', { cause: error });
        }
        throw error;
      }
    },
  };
}
