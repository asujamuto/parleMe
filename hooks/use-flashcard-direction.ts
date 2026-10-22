'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Direction } from '@/lib/flashcards/session';
import { loadDirection, saveDirection } from '@/lib/preferences/flashcard-direction';

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

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
