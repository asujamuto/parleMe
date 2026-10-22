import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { describe, expect, it } from 'vitest';
import { DB_VERSION, openParleMeDb } from '@/lib/storage/db';
import type { WordEntry, WordSet } from '@/lib/word-sets/types';

const set: WordSet = {
  id: 's1',
  name: 'Zestaw z wersji 1',
  source: 'csv',
  sourceFileName: 'a.csv',
  entryCount: 1,
  createdAt: '2026-10-22T10:00:00.000Z',
  updatedAt: '2026-10-22T10:00:00.000Z',
};
const entry: WordEntry = { id: 'e1', setId: 's1', italian: 'ciao', polish: 'cześć', position: 0 };

describe('openParleMeDb', () => {
  it('migruje bazę v1 do v2 bez utraty zestawów', async () => {
    const dbName = 'parleme-migration-test';
    const v1 = await openDB(dbName, 1, {
      upgrade(db) {
        db.createObjectStore('wordSets', { keyPath: 'id' }).createIndex('createdAt', 'createdAt');
        db.createObjectStore('wordEntries', { keyPath: 'id' }).createIndex('setId', 'setId');
      },
    });
    await v1.put('wordSets', set);
    await v1.put('wordEntries', entry);
    v1.close();

    const db = await openParleMeDb(dbName);

    expect(db.version).toBe(DB_VERSION);
    expect(await db.get('wordSets', 's1')).toEqual(set);
    expect(await db.getAllFromIndex('wordEntries', 'setId', 's1')).toEqual([entry]);
    expect(db.objectStoreNames.contains('wordProgress')).toBe(true);
    expect(await db.count('wordProgress')).toBe(0);
  });

  it('tworzy wszystkie magazyny w nowej bazie', async () => {
    const db = await openParleMeDb('parleme-fresh-test');

    expect(Array.from(db.objectStoreNames).sort()).toEqual(['wordEntries', 'wordProgress', 'wordSets']);
  });

  it('zwraca to samo połączenie dla tej samej bazy', async () => {
    expect(openParleMeDb('parleme-shared-test')).toBe(openParleMeDb('parleme-shared-test'));
  });
});
