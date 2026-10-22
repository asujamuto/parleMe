import type { Rating } from '@/lib/flashcards/session';

/** Liczba kolejnych sesji ze „Znam” przy pierwszym pokazaniu, po której słówko jest opanowane. */
export const MASTERED_STREAK = 2;

export interface WordProgress {
  /** → `WordEntry.id` */
  entryId: string;
  setId: string;
  lastRating: Rating;
  /** ISO 8601 */
  lastRatedAt: string;
  knownStreakSessions: number;
  mastered: boolean;
  knownTotal: number;
  unknownTotal: number;
}
