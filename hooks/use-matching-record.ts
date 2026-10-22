'use client';

import { useCallback, useEffect, useState } from 'react';
import { browserStorage } from '@/lib/preferences/browser-storage';
import { loadMatchingRecords, submitMatchingResult, type RecordOutcome } from '@/lib/preferences/matching-records';

export function useMatchingRecord(setId: string) {
  const [bestMs, setBestMs] = useState<number | null>(null);

  useEffect(() => {
    setBestMs(loadMatchingRecords(browserStorage())[setId]?.bestMs ?? null);
  }, [setId]);

  const submit = useCallback(
    (timeMs: number): RecordOutcome => {
      const outcome = submitMatchingResult(setId, timeMs, new Date(), browserStorage());
      setBestMs(outcome.bestMs);
      return outcome;
    },
    [setId],
  );

  return { bestMs, submit };
}
