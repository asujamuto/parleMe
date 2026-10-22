'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildWordSet } from '@/lib/word-sets/build-word-set';
import { newId } from '@/lib/word-sets/format';
import { createIndexedDbRepository } from '@/lib/word-sets/indexeddb-repository';
import { StorageError, type WordSetRepository } from '@/lib/word-sets/repository';
import { validateSetName } from '@/lib/word-sets/set-name';
import { clearLastMode } from '@/lib/preferences/last-mode';
import { clearLastStudiedSetId } from '@/lib/preferences/last-studied-set';
import { browserStorage } from '@/lib/preferences/browser-storage';
import type { ImportReport, WordEntry, WordSet } from '@/lib/word-sets/types';

let repository: WordSetRepository | null = null;

function getRepository() {
  repository ??= createIndexedDbRepository();
  return repository;
}

export function useWordSets() {
  const [sets, setSets] = useState<WordSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setSets(await getRepository().listSets());
      setError(null);
    } catch (err) {
      setError(err instanceof StorageError ? err.message : 'Nie udało się wczytać zestawów.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const createFromImport = useCallback(
    async (name: string, report: ImportReport, fileName: string) => {
      const { set, entries } = buildWordSet({ name, pairs: report.pairs, fileName, now: new Date(), newId });
      await getRepository().createSet(set, entries);
      await reload();
      return set;
    },
    [reload],
  );

  return { sets, loading, error, createFromImport };
}

export function useWordSet(setId: string) {
  const [data, setData] = useState<{ set: WordSet; entries: WordEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getRepository()
      .getSet(setId)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof StorageError ? err.message : 'Nie udało się wczytać zestawu.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, error, reload };
}

export function useWordSetActions() {
  const renameSet = useCallback(async (id: string, name: string) => {
    const validation = validateSetName(name);
    if (!validation.ok) throw new Error(validation.message);
    return getRepository().renameSet(id, name, new Date());
  }, []);

  const deleteSet = useCallback(async (id: string) => {
    await getRepository().deleteSet(id);
    clearLastStudiedSetId(id, browserStorage());
    clearLastMode(id, browserStorage());
  }, []);

  return { renameSet, deleteSet };
}
