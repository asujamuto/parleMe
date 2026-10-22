import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createIndexedDbProgressRepository } from '@/lib/progress/indexeddb-progress-repository';
import type { WordProgress } from '@/lib/progress/types';

let dbName: string;
let counter = 0;

beforeEach(() => {
  dbName = `parleme-progress-test-${++counter}`;
});

function progress(entryId: string, setId: string, mastered = false): WordProgress {
  return {
    entryId,
    setId,
    lastRating: 'known',
    lastRatedAt: '2026-10-22T10:00:00.000Z',
    knownStreakSessions: mastered ? 2 : 1,
    mastered,
    knownTotal: 1,
    unknownTotal: 0,
  };
}

describe('IndexedDB ProgressRepository', () => {
  it('zapisuje i odczytuje postęp zestawu, nadpisując po entryId', async () => {
    const repo = createIndexedDbProgressRepository(dbName);
    await repo.save(progress('e1', 's1'));
    await repo.save({ ...progress('e1', 's1'), lastRating: 'unknown' });

    const result = await repo.listBySet('s1');

    expect(result).toHaveLength(1);
    expect(result[0].lastRating).toBe('unknown');
  });

  it('zwraca postęp tylko wskazanego zestawu', async () => {
    const repo = createIndexedDbProgressRepository(dbName);
    await repo.save(progress('e1', 's1'));
    await repo.save(progress('e2', 's2'));

    expect((await repo.listBySet('s2')).map((p) => p.entryId)).toEqual(['e2']);
  });

  it('liczy opanowane słówka w każdym zestawie', async () => {
    const repo = createIndexedDbProgressRepository(dbName);
    await repo.save(progress('e1', 's1', true));
    await repo.save(progress('e2', 's1', true));
    await repo.save(progress('e3', 's1', false));
    await repo.save(progress('e4', 's2', false));

    const counts = await repo.masteredCountsBySet();

    expect(counts.s1).toBe(2);
    expect(counts.s2 ?? 0).toBe(0);
  });

  it('usuwa postęp tylko wskazanego zestawu', async () => {
    const repo = createIndexedDbProgressRepository(dbName);
    await repo.save(progress('e1', 's1'));
    await repo.save(progress('e2', 's2'));

    await repo.deleteBySet('s1');

    expect(await repo.listBySet('s1')).toEqual([]);
    expect(await repo.listBySet('s2')).toHaveLength(1);
  });
});
