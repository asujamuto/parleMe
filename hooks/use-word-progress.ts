'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Rating } from '@/lib/flashcards/session';
import {
  createIndexedDbProgressRepository,
  type ProgressRepository,
} from '@/lib/progress/indexeddb-progress-repository';
import { applyRating } from '@/lib/progress/progress';
import type { WordProgress } from '@/lib/progress/types';

const STORAGE_WARNING = 'Postęp nie zostanie zapamiętany na tym urządzeniu.';

let repository: ProgressRepository | null = null;

function getRepository() {
  repository ??= createIndexedDbProgressRepository();
  return repository;
}

export function useWordProgress(setId: string) {
  const [progress, setProgress] = useState<Record<string, WordProgress>>({});
  const progressRef = useRef(progress);
  const [loading, setLoading] = useState(true);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRepository()
      .listBySet(setId)
      .then((items) => {
        if (cancelled) return;
        progressRef.current = Object.fromEntries(items.map((item) => [item.entryId, item]));
        setProgress(progressRef.current);
      })
      .catch(() => {
        if (!cancelled) setStorageWarning(STORAGE_WARNING);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setId]);

  const saveRating = useCallback(
    ({ entryId, rating, firstInSession }: { entryId: string; rating: Rating; firstInSession: boolean }) => {
      const next = applyRating(progressRef.current[entryId], {
        entryId,
        setId,
        rating,
        firstInSession,
        now: new Date(),
      });
      progressRef.current = { ...progressRef.current, [entryId]: next };
      setProgress(progressRef.current);
      getRepository()
        .save(next)
        .catch(() => setStorageWarning(STORAGE_WARNING));
    },
    [setId],
  );

  return { progress, loading, saveRating, storageWarning };
}

export function useMasteredCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    getRepository()
      .masteredCountsBySet()
      .then((result) => {
        if (!cancelled) setCounts(result);
      })
      .catch(() => {
        // Bez dostępu do pamięci lista pokazuje 0 opanowanych.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
}
