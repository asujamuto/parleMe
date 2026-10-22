'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Direction } from '@/lib/flashcards/session';
import { browserStorage } from '@/lib/preferences/browser-storage';
import { loadDirection, saveDirection } from '@/lib/preferences/flashcard-direction';

export function useFlashcardDirection() {
  const [direction, setDirectionState] = useState<Direction>('it-pl');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDirectionState(loadDirection(browserStorage()));
    setReady(true);
  }, []);

  const setDirection = useCallback((next: Direction) => {
    setDirectionState(next);
    saveDirection(next, browserStorage());
  }, []);

  return { direction, ready, setDirection };
}
