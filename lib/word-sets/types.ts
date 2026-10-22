export const MAX_FILE_BYTES = 1_048_576;
export const MAX_ROWS = 2000;
export const MAX_SET_NAME_LENGTH = 60;

export type WordSetSource = 'csv' | 'sample' | 'manual';

export interface WordSet {
  id: string;
  /** Po trim 1–60 znaków; nazwy mogą się powtarzać. */
  name: string;
  source: WordSetSource;
  sourceFileName: string | null;
  entryCount: number;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

export interface WordEntry {
  /** Stały identyfikator — klucz dla postępu nauki. */
  id: string;
  setId: string;
  italian: string;
  polish: string;
  /** Kolejność z pliku, od 0. */
  position: number;
}

export interface ImportedPair {
  italian: string;
  polish: string;
  /** Numer wiersza w pliku (nagłówek = 1). */
  line: number;
}

export interface SkippedRow {
  line: number;
  reason: string;
}

export interface DuplicateRow {
  line: number;
  firstLine: number;
}

export type ImportBlockingErrorCode =
  | 'FILE_TOO_LARGE'
  | 'EMPTY_FILE'
  | 'MISSING_COLUMNS'
  | 'TOO_MANY_ROWS'
  | 'NO_VALID_ROWS'
  | 'UNREADABLE';

export interface ImportBlockingError {
  code: ImportBlockingErrorCode;
  message: string;
}

export interface ImportReport {
  status: 'ok' | 'blocked';
  blockingError: ImportBlockingError | null;
  pairs: ImportedPair[];
  skipped: SkippedRow[];
  duplicates: DuplicateRow[];
  /** Rekordy danych bez nagłówka i końcowych pustych linii. */
  totalRows: number;
}
