export const MATCHING_RECORDS_KEY = 'parleme.matchingRecords';

export interface MatchingRecord {
  bestMs: number;
  /** ISO 8601 */
  achievedAt: string;
}

export interface RecordOutcome {
  isNewRecord: boolean;
  previousBestMs: number | null;
  bestMs: number;
}

/** Rekord bije tylko czas ściśle krótszy. */
export function isNewRecord(previousBestMs: number | null, timeMs: number): boolean {
  return previousBestMs === null || timeMs < previousBestMs;
}

/** Brak/uszkodzone dane albo błąd odczytu → `{}`; niepoprawne wpisy są pomijane. */
export function loadMatchingRecords(storage?: Pick<Storage, 'getItem'>): Record<string, MatchingRecord> {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(MATCHING_RECORDS_KEY) ?? '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, MatchingRecord] =>
          typeof entry[1] === 'object' &&
          entry[1] !== null &&
          typeof (entry[1] as MatchingRecord).bestMs === 'number' &&
          typeof (entry[1] as MatchingRecord).achievedAt === 'string',
      ),
    );
  } catch {
    return {};
  }
}

/** Zapisuje wynik tylko, gdy to nowy rekord zestawu; nigdy nie rzuca. */
export function submitMatchingResult(
  setId: string,
  timeMs: number,
  now: Date,
  storage?: Pick<Storage, 'getItem' | 'setItem'>,
): RecordOutcome {
  const records = loadMatchingRecords(storage);
  const previousBestMs = records[setId]?.bestMs ?? null;

  if (!isNewRecord(previousBestMs, timeMs)) {
    return { isNewRecord: false, previousBestMs, bestMs: previousBestMs ?? timeMs };
  }

  try {
    storage?.setItem(
      MATCHING_RECORDS_KEY,
      JSON.stringify({ ...records, [setId]: { bestMs: timeMs, achievedAt: now.toISOString() } }),
    );
  } catch {
    // Rekord nie zostanie zapamiętany — wynik rundy i tak jest pokazywany.
  }
  return { isNewRecord: true, previousBestMs, bestMs: timeMs };
}

export function clearMatchingRecord(setId: string, storage?: Pick<Storage, 'getItem' | 'setItem'>): void {
  try {
    const records = loadMatchingRecords(storage);
    if (!(setId in records)) return;
    delete records[setId];
    storage?.setItem(MATCHING_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Ignorowane — rekord usuniętego zestawu nie jest nigdzie wyświetlany.
  }
}
