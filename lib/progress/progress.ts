import type { Rating } from '@/lib/flashcards/session';
import type { WordEntry } from '@/lib/word-sets/types';
import { MASTERED_STREAK, type WordProgress } from './types';

interface RatingInput {
  entryId: string;
  setId: string;
  rating: Rating;
  /** Czy to pierwsza ocena tej karty w bieżącej sesji (powtórki nie zmieniają serii). */
  firstInSession: boolean;
  now: Date;
}

export function applyRating(
  previous: WordProgress | undefined,
  { entryId, setId, rating, firstInSession, now }: RatingInput,
): WordProgress {
  const known = rating === 'known';
  let knownStreakSessions = previous?.knownStreakSessions ?? 0;
  let mastered = previous?.mastered ?? false;

  if (firstInSession) {
    knownStreakSessions = known ? knownStreakSessions + 1 : 0;
    mastered = knownStreakSessions >= MASTERED_STREAK;
  }

  return {
    entryId,
    setId,
    lastRating: rating,
    lastRatedAt: now.toISOString(),
    knownStreakSessions,
    mastered,
    knownTotal: (previous?.knownTotal ?? 0) + (known ? 1 : 0),
    unknownTotal: (previous?.unknownTotal ?? 0) + (known ? 0 : 1),
  };
}

/**
 * Kolejność kart nowej rundy (FR-012): ostatnio „Nie znam” → nigdy niepokazane (wg pliku)
 * → znane, nieopanowane → opanowane. Grupy z historią są mieszane.
 */
export function orderEntriesForSession(
  entries: WordEntry[],
  progressByEntryId: Record<string, WordProgress>,
  random: () => number = Math.random,
): WordEntry[] {
  const unknown: WordEntry[] = [];
  const fresh: WordEntry[] = [];
  const learning: WordEntry[] = [];
  const mastered: WordEntry[] = [];

  for (const entry of entries) {
    const progress = progressByEntryId[entry.id];
    if (!progress) fresh.push(entry);
    else if (progress.lastRating === 'unknown') unknown.push(entry);
    else if (progress.mastered) mastered.push(entry);
    else learning.push(entry);
  }

  return [
    ...shuffle(unknown, random),
    ...fresh.sort((a, b) => a.position - b.position),
    ...shuffle(learning, random),
    ...shuffle(mastered, random),
  ];
}

export function countMastered(progress: WordProgress[]): number {
  return progress.filter((p) => p.mastered).length;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
