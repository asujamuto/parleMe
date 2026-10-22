import Papa from 'papaparse';
import { wordRowSchema } from '@/utils/csvParserSchema';
import {
  MAX_FILE_BYTES,
  MAX_ROWS,
  type DuplicateRow,
  type ImportBlockingError,
  type ImportBlockingErrorCode,
  type ImportedPair,
  type ImportReport,
  type SkippedRow,
} from './types';

const REQUIRED_COLUMNS = ['italian', 'polish'] as const;

/** Nagłówek = wiersz 1, pierwszy rekord = wiersz 2 (jak w arkuszu). */
const FIRST_DATA_LINE = 2;

type CsvRecord = Record<string, unknown>;

export function parseWordsCsv(text: string, { fileSize }: { fileSize: number }): ImportReport {
  if (fileSize > MAX_FILE_BYTES) {
    return blocked('FILE_TOO_LARGE', 'Plik jest za duży (maks. 1 MB).');
  }

  const content = text.replace(/^﻿/, '');
  if (content.trim() === '') {
    return blocked('EMPTY_FILE', 'Plik jest pusty.');
  }
  if (content.includes('\u0000')) {
    return blocked('UNREADABLE', 'Nie udało się odczytać pliku jako CSV. Sprawdź, czy to plik tekstowy.');
  }

  const result = Papa.parse<CsvRecord>(content, {
    header: true,
    skipEmptyLines: false,
    delimitersToGuess: [',', ';'],
    transformHeader: (header) => header.replace(/^﻿/, '').trim().toLowerCase(),
  });

  const fields = result.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter((column) => !fields.includes(column));
  if (missing.length > 0) {
    const label = missing.length === 1 ? 'Brak wymaganej kolumny' : 'Brak wymaganych kolumn';
    return blocked(
      'MISSING_COLUMNS',
      `${label}: ${missing.join(', ')}. Pierwszy wiersz pliku musi zawierać nagłówki italian i polish.`,
    );
  }

  const records = [...result.data];
  while (records.length > 0 && isBlank(records[records.length - 1])) {
    records.pop();
  }

  if (records.length > MAX_ROWS) {
    return blocked('TOO_MANY_ROWS', `Plik ma więcej niż ${MAX_ROWS} wierszy. Podziel go na mniejsze zestawy.`);
  }

  const quoteErrorRows = new Set(
    result.errors.filter((error) => error.type === 'Quotes' && error.row != null).map((error) => error.row),
  );

  const pairs: ImportedPair[] = [];
  const skipped: SkippedRow[] = [];
  const duplicates: DuplicateRow[] = [];
  const firstLineByKey = new Map<string, number>();

  records.forEach((record, index) => {
    const line = index + FIRST_DATA_LINE;

    if (quoteErrorRows.has(index)) {
      skipped.push({ line, reason: 'niepoprawne cudzysłowy' });
      return;
    }
    if (isBlank(record)) {
      skipped.push({ line, reason: 'pusty wiersz' });
      return;
    }

    const parsed = wordRowSchema.safeParse({
      italian: toText(record.italian),
      polish: toText(record.polish),
    });
    if (!parsed.success) {
      skipped.push({ line, reason: parsed.error.issues.map((issue) => issue.message).join(', ') });
      return;
    }

    const key = `${normalizeForComparison(parsed.data.italian)}\u0000${normalizeForComparison(parsed.data.polish)}`;
    const firstLine = firstLineByKey.get(key);
    if (firstLine !== undefined) {
      duplicates.push({ line, firstLine });
      return;
    }

    firstLineByKey.set(key, line);
    pairs.push({ italian: parsed.data.italian, polish: parsed.data.polish, line });
  });

  const report: ImportReport = {
    status: 'ok',
    blockingError: null,
    pairs,
    skipped,
    duplicates,
    totalRows: records.length,
  };

  if (pairs.length === 0) {
    return {
      ...report,
      status: 'blocked',
      blockingError: { code: 'NO_VALID_ROWS', message: 'Nie znaleziono żadnej poprawnej pary słówek.' },
    };
  }

  return report;
}

function blocked(code: ImportBlockingErrorCode, message: string): ImportReport {
  const blockingError: ImportBlockingError = { code, message };
  return { status: 'blocked', blockingError, pairs: [], skipped: [], duplicates: [], totalRows: 0 };
}

function toText(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.join('');
  return String(value);
}

function isBlank(record: CsvRecord): boolean {
  return Object.values(record).every((value) => toText(value).trim() === '');
}

function normalizeForComparison(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl');
}
