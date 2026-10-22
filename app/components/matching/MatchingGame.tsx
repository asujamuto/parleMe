'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  createMatchingState,
  elapsedMs,
  formatSeconds,
  matchingReducer,
  type MatchingAction,
  type MatchingTile,
} from '@/lib/matching/game';
import { cn } from '@/lib/utils';
import type { WordEntry } from '@/lib/word-sets/types';
import { MatchingResult } from './MatchingResult';

const FEEDBACK_MS = 500;

interface MatchingGameProps {
  pairs: WordEntry[];
  exitHref: string;
  onRestart: () => void;
}

function textSizeClass(text: string) {
  if (text.length <= 20) return 'text-lg';
  if (text.length <= 50) return 'text-base';
  return 'text-sm';
}

export function MatchingGame({ pairs, exitHref, onRestart }: MatchingGameProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [state, dispatch] = useReducer(matchingReducer, undefined, () =>
    createMatchingState(pairs, { now: Date.now() }),
  );
  // Stan liczony synchronicznie, aby ogłosić wynik próby i nie liczyć podwójnych dotknięć.
  const stateRef = useRef(state);
  stateRef.current = state;
  const [now, setNow] = useState(() => Date.now());
  const [announcement, setAnnouncement] = useState('');
  const finished = state.finishedAt !== null;

  useEffect(() => {
    if (finished) return;
    const interval = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, [finished]);

  useEffect(() => {
    if (!state.wrongTileIds) return;
    const timeout = window.setTimeout(() => dispatch({ type: 'clearFeedback' }), FEEDBACK_MS);
    return () => window.clearTimeout(timeout);
  }, [state.wrongTileIds]);

  const selectTile = useCallback((tileId: string) => {
    const before = stateRef.current;
    const action: MatchingAction = { type: 'select', tileId, now: Date.now() };
    const after = matchingReducer(before, action);
    if (after === before) return;

    stateRef.current = after;
    if (after.matchedEntryIds.length > before.matchedEntryIds.length) setAnnouncement('Para!');
    else if (after.mistakes > before.mistakes) setAnnouncement('Błąd, plus 1 sekunda');
    dispatch(action);
  }, []);

  if (finished) {
    return (
      <MatchingResult
        timeMs={elapsedMs(state, state.finishedAt!)}
        mistakes={state.mistakes}
        errorPairs={state.pairs.filter((pair) => state.errorEntryIds.includes(pair.id))}
        exitHref={exitHref}
        onRestart={onRestart}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-2xl font-bold tabular-nums" aria-label="Czas">
          {formatSeconds(elapsedMs(state, now))}
        </span>
        <span className="text-sm font-medium">Błędy: {state.mistakes}</span>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4" aria-label="Plansza">
        {state.tiles.map((tile) => (
          <li key={tile.id}>
            <Tile
              tile={tile}
              matched={state.matchedEntryIds.includes(tile.entryId)}
              selected={state.selectedTileId === tile.id}
              wrong={state.wrongTileIds?.includes(tile.id) ?? false}
              reduceMotion={reduceMotion ?? false}
              onSelect={selectTile}
            />
          </li>
        ))}
      </ul>

      <div className="flex justify-center">
        <Button type="button" variant="ghost" className="h-11" onClick={() => router.push(exitHref)}>
          Zakończ
        </Button>
      </div>
    </div>
  );
}

interface TileProps {
  tile: MatchingTile;
  matched: boolean;
  selected: boolean;
  wrong: boolean;
  reduceMotion: boolean;
  onSelect: (tileId: string) => void;
}

function Tile({ tile, matched, selected, wrong, reduceMotion, onSelect }: TileProps) {
  return (
    <motion.button
      type="button"
      lang={tile.lang}
      aria-pressed={selected}
      aria-hidden={matched || undefined}
      tabIndex={matched ? -1 : undefined}
      disabled={matched}
      onClick={() => onSelect(tile.id)}
      animate={wrong && !reduceMotion ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'flex h-full min-h-[5.5rem] w-full items-center justify-center rounded-lg border-2 bg-card p-2 text-center font-medium break-words shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        textSizeClass(tile.text),
        selected && 'border-primary bg-primary/10',
        wrong && 'border-destructive bg-destructive/10 text-destructive',
        matched && 'invisible',
      )}
    >
      {tile.text}
    </motion.button>
  );
}
