'use client';

import { useCallback, useEffect, useState } from 'react';
import type { StudyModeId } from '@/lib/modes/catalog';
import { browserStorage } from '@/lib/preferences/browser-storage';
import { loadLastModes, saveLastMode } from '@/lib/preferences/last-mode';

export function useLastMode(setId: string) {
  const [lastModeId, setLastModeId] = useState<StudyModeId | null>(null);

  useEffect(() => {
    setLastModeId(loadLastModes(browserStorage())[setId] ?? null);
  }, [setId]);

  const markModeUsed = useCallback(
    (modeId: StudyModeId) => {
      setLastModeId(modeId);
      saveLastMode(setId, modeId, browserStorage());
    },
    [setId],
  );

  return { lastModeId, markModeUsed };
}
