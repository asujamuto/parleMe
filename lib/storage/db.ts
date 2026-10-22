import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { WordProgress } from '@/lib/progress/types';
import { StorageError } from '@/lib/word-sets/repository';
import type { WordEntry, WordSet } from '@/lib/word-sets/types';

export const DB_VERSION = 2;

export interface ParleMeDB extends DBSchema {
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
  wordProgress: {
    key: string;
    value: WordProgress;
    indexes: { setId: string };
  };
}

const connections = new Map<string, Promise<IDBPDatabase<ParleMeDB>>>();

/** Jedno współdzielone połączenie na bazę; migracje tylko dodają magazyny. */
export function openParleMeDb(dbName = 'parleme'): Promise<IDBPDatabase<ParleMeDB>> {
  const existing = connections.get(dbName);
  if (existing) return existing;

  const connection = openDB<ParleMeDB>(dbName, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const sets = db.createObjectStore('wordSets', { keyPath: 'id' });
        sets.createIndex('createdAt', 'createdAt');
        const entries = db.createObjectStore('wordEntries', { keyPath: 'id' });
        entries.createIndex('setId', 'setId');
      }
      if (oldVersion < 2) {
        const progress = db.createObjectStore('wordProgress', { keyPath: 'entryId' });
        progress.createIndex('setId', 'setId');
      }
    },
    blocking() {
      // Inna karta aktualizuje bazę — zamknij to połączenie, następne wywołanie otworzy nowe.
      connections.delete(dbName);
      connection.then((db) => db.close()).catch(() => {});
    },
    terminated() {
      connections.delete(dbName);
    },
  }).catch((error: unknown) => {
    connections.delete(dbName);
    throw new StorageError('UNAVAILABLE', { cause: error });
  });

  connections.set(dbName, connection);
  return connection;
}

export function isQuotaExceeded(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'QuotaExceededError';
}
