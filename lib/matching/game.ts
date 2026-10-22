import type { Rating } from '@/lib/flashcards/session';
import { orderEntriesForSession } from '@/lib/progress/progress';
import type { WordProgress } from '@/lib/progress/types';
import type { WordEntry } from '@/lib/word-sets/types';

export const MATCHING_PAIRS = 6;
export const PENALTY_MS = 1000;
export const MIN_PAIRS = 2;

export interface MatchingTile {
  /** `${entryId}:it` albo `${entryId}:pl` */
  id: string;
  entryId: string;
  lang: 'it' | 'pl';
  text: string;
}

export interface MatchingState {
  pairs: WordEntry[];
  tiles: MatchingTile[];
  selectedTileId: string | null;
  matchedEntryIds: string[];
  mistakes: number;
  /** Słówka biorące udział w co najmniej jednej błędnej próbie. */
  errorEntryIds: string[];
  /** Ostatnia błędna próba — do krótkiej sygnalizacji na planszy. */
  wrongTileIds: [string, string] | null;
  startedAt: number;
  finishedAt: number | null;
}

export type MatchingAction = { type: 'select'; tileId: string; now: number } | { type: 'clearFeedback' };

export interface MatchingRating {
  entryId: string;
  rating: Rating;
  firstInSession: boolean;
}

export interface MatchingRoundResult {
  timeMs: number;
  ratings: MatchingRating[];
}

interface SelectPairsOptions {
  random?: () => number;
  maxPairs?: number;
  /** Postęp słówek wg `entryId` — najpierw trudne słówka (FR-015); bez niego losowo. */
  progress?: Record<string, WordProgress>;
}

/** Do `maxPairs` par bez powtórzeń tekstu włoskiego ani polskiego — każdy kafelek ma jeden odpowiednik. */
export function selectPairs(
  entries: WordEntry[],
  { random = Math.random, maxPairs = MATCHING_PAIRS, progress }: SelectPairsOptions = {},
): WordEntry[] {
  const seenItalian = new Set<string>();
  const seenPolish = new Set<string>();
  const pairs: WordEntry[] = [];
  const ordered = progress ? orderEntriesForSession(entries, progress, random) : shuffle(entries, random);

  for (const entry of ordered) {
    if (pairs.length >= maxPairs) break;
    const italian = normalize(entry.italian);
    const polish = normalize(entry.polish);
    if (seenItalian.has(italian) || seenPolish.has(polish)) continue;
    seenItalian.add(italian);
    seenPolish.add(polish);
    pairs.push(entry);
  }
  return pairs;
}

export function createBoard(pairs: WordEntry[], random: () => number = Math.random): MatchingTile[] {
  const tiles = pairs.flatMap<MatchingTile>((entry) => [
    { id: `${entry.id}:it`, entryId: entry.id, lang: 'it', text: entry.italian },
    { id: `${entry.id}:pl`, entryId: entry.id, lang: 'pl', text: entry.polish },
  ]);
  return shuffle(tiles, random);
}

export function createMatchingState(
  pairs: WordEntry[],
  { now, random }: { now: number; random?: () => number },
): MatchingState {
  return {
    pairs,
    tiles: createBoard(pairs, random),
    selectedTileId: null,
    matchedEntryIds: [],
    mistakes: 0,
    errorEntryIds: [],
    wrongTileIds: null,
    startedAt: now,
    finishedAt: null,
  };
}

export function matchingReducer(state: MatchingState, action: MatchingAction): MatchingState {
  if (action.type === 'clearFeedback') {
    return state.wrongTileIds ? { ...state, wrongTileIds: null } : state;
  }

  const tile = state.tiles.find((t) => t.id === action.tileId);
  if (!tile || state.finishedAt !== null || state.matchedEntryIds.includes(tile.entryId)) return state;

  const selected = state.tiles.find((t) => t.id === state.selectedTileId);
  if (!selected) return { ...state, selectedTileId: tile.id, wrongTileIds: null };
  if (selected.id === tile.id) return { ...state, selectedTileId: null };
  if (selected.lang === tile.lang) return { ...state, selectedTileId: tile.id };

  if (selected.entryId === tile.entryId) {
    const matchedEntryIds = [...state.matchedEntryIds, tile.entryId];
    return {
      ...state,
      selectedTileId: null,
      matchedEntryIds,
      finishedAt: matchedEntryIds.length === state.pairs.length ? action.now : null,
    };
  }

  const errorEntryIds = new Set([...state.errorEntryIds, selected.entryId, tile.entryId]);
  return {
    ...state,
    selectedTileId: null,
    mistakes: state.mistakes + 1,
    errorEntryIds: Array.from(errorEntryIds),
    wrongTileIds: [selected.id, tile.id],
  };
}

/** Czas rundy z karami; po zakończeniu się nie zmienia. */
export function elapsedMs(state: MatchingState, now: number): number {
  return (state.finishedAt ?? now) - state.startedAt + state.mistakes * PENALTY_MS;
}

/**
 * Oceny słówek po ukończonej rundzie (FR-014): błąd → „Nie znam” jak pierwsza ocena w sesji
 * (odbiera opanowanie); bez błędu → „Znam” bez wpływu na serię — opanowanie tylko w fiszkach.
 */
export function roundResult(state: MatchingState): MatchingRoundResult {
  return {
    timeMs: elapsedMs(state, state.finishedAt ?? state.startedAt),
    ratings: state.pairs.map((pair) =>
      state.errorEntryIds.includes(pair.id)
        ? { entryId: pair.id, rating: 'unknown', firstInSession: true }
        : { entryId: pair.id, rating: 'known', firstInSession: false },
    ),
  };
}

/** `12340` → `"12,3 s"` */
export function formatSeconds(ms: number): string {
  return `${(Math.max(0, ms) / 1000).toFixed(1).replace('.', ',')} s`;
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl');
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
