'use client';

import { useCallback, useEffect, useState } from 'react';
import { browserStorage } from '@/lib/preferences/browser-storage';
import { loadLastStudiedSetId, saveLastStudiedSetId } from '@/lib/preferences/last-studied-set';

export function useLastStudiedSet() {
  const [lastStudiedSetId, setLastStudiedSetId] = useState<string | null>(null);

  useEffect(() => {
    setLastStudiedSetId(loadLastStudiedSetId(browserStorage()));
  }, []);

  const markStudied = useCallback((id: string) => {
    setLastStudiedSetId(id);
    saveLastStudiedSetId(id, browserStorage());
  }, []);

  return { lastStudiedSetId, markStudied };
}
