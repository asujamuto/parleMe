import { orderEntriesForSession } from '@/lib/progress/progress';
import type { WordProgress } from '@/lib/progress/types';
import type { WordEntry } from '@/lib/word-sets/types';

export const MAX_CARDS_PER_ROUND = 20;

export type Rating = 'known' | 'unknown';
export type Direction = 'it-pl' | 'pl-it';

export interface FlashcardSession {
  setId: string;
  direction: Direction;
  cards: WordEntry[];
  /** Id kart do pokazania; `queue[0]` to bieżąca karta. */
  queue: string[];
  flipped: boolean;
  /** Pierwsza ocena każdej karty w rundzie. */
  firstRatings: Record<string, Rating>;
  knownCount: number;
  startedAt: number;
  finishedAt: number | null;
}

export type SessionAction =
  | { type: 'flip' }
  | { type: 'rate'; rating: Rating; now: number }
  | { type: 'setDirection'; direction: Direction };

export interface SessionSummary {
  knownFirstTry: number;
  repeated: WordEntry[];
  durationMs: number;
}

interface CreateSessionOptions {
  now: number;
  maxCards?: number;
  direction?: Direction;
  /** Postęp słówek wg `entryId`; bez niego karty idą w kolejności z pliku. */
  progress?: Record<string, WordProgress>;
  random?: () => number;
}

export function createSession(
  setId: string,
  entries: WordEntry[],
  { now, maxCards = MAX_CARDS_PER_ROUND, direction = 'it-pl', progress, random }: CreateSessionOptions,
): FlashcardSession {
  const ordered = progress
    ? orderEntriesForSession(entries, progress, random)
    : [...entries].sort((a, b) => a.position - b.position);
  const cards = ordered.slice(0, maxCards);
  return {
    setId,
    direction,
    cards,
    queue: cards.map((card) => card.id),
    flipped: false,
    firstRatings: {},
    knownCount: 0,
    startedAt: now,
    finishedAt: null,
  };
}

export function sessionReducer(state: FlashcardSession, action: SessionAction): FlashcardSession {
  if (state.queue.length === 0) return state;

  switch (action.type) {
    case 'flip':
      return state.flipped ? state : { ...state, flipped: true };

    case 'rate': {
      if (!state.flipped) return state;
      const [cardId, ...rest] = state.queue;
      const firstRatings =
        cardId in state.firstRatings ? state.firstRatings : { ...state.firstRatings, [cardId]: action.rating };

      if (action.rating === 'known') {
        return {
          ...state,
          queue: rest,
          flipped: false,
          firstRatings,
          knownCount: state.knownCount + 1,
          finishedAt: rest.length === 0 ? action.now : null,
        };
      }
      return { ...state, queue: [...rest, cardId], flipped: false, firstRatings };
    }

    case 'setDirection':
      return state.direction === action.direction ? state : { ...state, direction: action.direction, flipped: false };
  }
}

export function currentCard(state: FlashcardSession): WordEntry | null {
  const cardId = state.queue[0];
  return state.cards.find((card) => card.id === cardId) ?? null;
}

export function cardSides(card: WordEntry, direction: Direction) {
  return direction === 'it-pl'
    ? { front: card.italian, back: card.polish, frontLang: 'it', backLang: 'pl' }
    : { front: card.polish, back: card.italian, frontLang: 'pl', backLang: 'it' };
}

export function getSessionSummary(state: FlashcardSession): SessionSummary {
  return {
    knownFirstTry: state.cards.filter((card) => state.firstRatings[card.id] === 'known').length,
    repeated: state.cards.filter((card) => state.firstRatings[card.id] === 'unknown'),
    durationMs: (state.finishedAt ?? state.startedAt) - state.startedAt,
  };
}

/** `65000` → `"1:05"`. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
