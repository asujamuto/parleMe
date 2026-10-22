import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createIndexedDbProgressRepository } from '@/lib/progress/indexeddb-progress-repository';
import type { WordProgress } from '@/lib/progress/types';
import { createIndexedDbRepository } from '@/lib/word-sets/indexeddb-repository';
import type { WordEntry, WordSet } from '@/lib/word-sets/types';

let dbName: string;
let counter = 0;

beforeEach(() => {
  dbName = `parleme-test-${++counter}`;
});

function makeSet(id: string, createdAt: string, entryCount = 2): WordSet {
  return {
    id,
    name: `Zestaw ${id}`,
    source: 'csv',
    sourceFileName: `${id}.csv`,
    entryCount,
    createdAt,
    updatedAt: createdAt,
  };
}

function makeEntries(setId: string): WordEntry[] {
  return [
    { id: `${setId}-b`, setId, italian: 'grazie', polish: 'dziękuję', position: 1 },
    { id: `${setId}-a`, setId, italian: 'ciao', polish: 'cześć', position: 0 },
  ];
}

describe('IndexedDB WordSetRepository', () => {
  it('zapisuje zestaw i zwraca słówka w kolejności position', async () => {
    const repo = createIndexedDbRepository(dbName);
    const set = makeSet('s1', '2026-10-22T10:00:00.000Z');

    await repo.createSet(set, makeEntries('s1'));
    const result = await repo.getSet('s1');

    expect(result?.set).toEqual(set);
    expect(result?.entries.map((e) => e.italian)).toEqual(['ciao', 'grazie']);
  });

  it('zwraca null dla nieistniejącego zestawu', async () => {
    expect(await createIndexedDbRepository(dbName).getSet('brak')).toBeNull();
  });

  it('listuje zestawy od najnowszego', async () => {
    const repo = createIndexedDbRepository(dbName);
    await repo.createSet(makeSet('old', '2026-10-01T10:00:00.000Z'), makeEntries('old'));
    await repo.createSet(makeSet('new', '2026-10-22T10:00:00.000Z'), makeEntries('new'));
    await repo.createSet(makeSet('mid', '2026-10-10T10:00:00.000Z'), makeEntries('mid'));

    const sets = await repo.listSets();

    expect(sets.map((s) => s.id)).toEqual(['new', 'mid', 'old']);
  });

  it('nie zapisuje niczego, gdy transakcja się nie powiedzie', async () => {
    const repo = createIndexedDbRepository(dbName);
    const entries = makeEntries('s1');
    entries[1] = { ...entries[1], id: entries[0].id };

    await expect(repo.createSet(makeSet('s1', '2026-10-22T10:00:00.000Z'), entries)).rejects.toThrow();

    expect(await repo.listSets()).toEqual([]);
    expect(await repo.getSet('s1')).toBeNull();
  });

  it('zachowuje dane między instancjami repozytorium', async () => {
    await createIndexedDbRepository(dbName).createSet(makeSet('s1', '2026-10-22T10:00:00.000Z'), makeEntries('s1'));

    const sets = await createIndexedDbRepository(dbName).listSets();

    expect(sets.map((s) => s.id)).toEqual(['s1']);
  });
});

function makeProgress(entryId: string, setId: string): WordProgress {
  return {
    entryId,
    setId,
    lastRating: 'known',
    lastRatedAt: '2026-10-22T10:00:00.000Z',
    knownStreakSessions: 1,
    mastered: false,
    knownTotal: 1,
    unknownTotal: 0,
  };
}

describe('IndexedDB WordSetRepository — zarządzanie (US2)', () => {
  it('renameSet zmienia nazwę i updatedAt, zostawiając słówka', async () => {
    const repo = createIndexedDbRepository(dbName);
    await repo.createSet(makeSet('s1', '2026-10-01T10:00:00.000Z'), makeEntries('s1'));
    const now = new Date('2026-10-22T12:00:00.000Z');

    const renamed = await repo.renameSet('s1', '  Nowa  ', now);

    expect(renamed).toMatchObject({ name: 'Nowa', updatedAt: now.toISOString(), createdAt: '2026-10-01T10:00:00.000Z' });
    const stored = await repo.getSet('s1');
    expect(stored?.set.name).toBe('Nowa');
    expect(stored?.entries.map((e) => e.id)).toEqual(['s1-a', 's1-b']);
  });

  it('renameSet nieistniejącego zestawu zwraca null', async () => {
    expect(await createIndexedDbRepository(dbName).renameSet('brak', 'X', new Date())).toBeNull();
  });

  it('deleteSet usuwa zestaw, jego słówka i postęp, nie ruszając innych', async () => {
    const repo = createIndexedDbRepository(dbName);
    const progressRepo = createIndexedDbProgressRepository(dbName);
    await repo.createSet(makeSet('s1', '2026-10-01T10:00:00.000Z'), makeEntries('s1'));
    await repo.createSet(makeSet('s2', '2026-10-02T10:00:00.000Z'), makeEntries('s2'));
    await progressRepo.save(makeProgress('s1-a', 's1'));
    await progressRepo.save(makeProgress('s2-a', 's2'));

    await repo.deleteSet('s1');

    expect(await repo.getSet('s1')).toBeNull();
    expect((await repo.listSets()).map((s) => s.id)).toEqual(['s2']);
    expect(await progressRepo.listBySet('s1')).toEqual([]);
    expect(await progressRepo.listBySet('s2')).toHaveLength(1);
    expect((await repo.getSet('s2'))?.entries).toHaveLength(2);
  });

  it('deleteSet nieistniejącego zestawu nie zgłasza błędu', async () => {
    await expect(createIndexedDbRepository(dbName).deleteSet('brak')).resolves.toBeUndefined();
  });
});
