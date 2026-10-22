import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { parseWordsCsv } from '@/lib/word-sets/parse-csv';
import { MAX_FILE_BYTES, MAX_ROWS } from '@/lib/word-sets/types';

const root = path.resolve(__dirname, '../../..');

function readFile(relativePath: string) {
  const buffer = readFileSync(path.join(root, relativePath));
  return { text: buffer.toString('utf8'), fileSize: buffer.byteLength };
}

function parseFile(relativePath: string) {
  const { text, fileSize } = readFile(relativePath);
  return parseWordsCsv(text, { fileSize });
}

function parseText(text: string) {
  return parseWordsCsv(text, { fileSize: Buffer.byteLength(text) });
}

/** Niezależny od PapaParse podział linii CSV (RFC 4180, bez wieloliniowych pól). */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

function generateCsv(rows: number) {
  const lines = ['italian,polish'];
  for (let i = 0; i < rows; i++) lines.push(`parola ${i},słowo ${i}`);
  return lines.join('\n') + '\n';
}

describe('parseWordsCsv — dołączone pliki ITA5 (SC-002)', () => {
  const files: [string, number][] = [
    ['app/data/2ita1/ITA5(Codzienne zwroty i pytania ).csv', 21],
    ['app/data/2ita1/ITA5(Pytania osobiste i ogólne słowa).csv', 15],
    ['app/data/2ita1/ITA5(Tematy codzienne i słownictwo).csv', 3],
    ['app/data/2ita1/ITA5(Zwierzęta i porównania (idiomy)).csv', 18],
  ];

  it.each(files)('%s → %i par bez pominięć', (file, expectedPairs) => {
    const report = parseFile(file);

    expect(report.status).toBe('ok');
    expect(report.blockingError).toBeNull();
    expect(report.pairs).toHaveLength(expectedPairs);
    expect(report.skipped).toEqual([]);
    expect(report.duplicates).toEqual([]);
  });

  it.each(files)('%s → treść identyczna ze źródłem', (file) => {
    const { text } = readFile(file);
    const sourceLines = text
      .replace(/^﻿/, '')
      .split(/\r?\n/)
      .slice(1)
      .filter((line) => line.trim() !== '');

    const report = parseFile(file);

    report.pairs.forEach((pair, i) => {
      const [italian, polish] = splitCsvLine(sourceLines[i]);
      expect(pair).toEqual({ italian: italian.trim(), polish: polish.trim(), line: i + 2 });
    });
  });

  it('obsługuje nagłówek " polish" ze spacją, BOM i CRLF', () => {
    const report = parseText('﻿italian, Polish \r\nciao,cześć\r\n');

    expect(report.status).toBe('ok');
    expect(report.pairs).toEqual([{ italian: 'ciao', polish: 'cześć', line: 2 }]);
  });
});

describe('parseWordsCsv — błędne wiersze', () => {
  it('wymienia pominięte wiersze i powtórzenia z numerami linii', () => {
    const report = parseFile('tests/fixtures/with-errors.csv');

    expect(report.status).toBe('ok');
    expect(report.pairs).toEqual([
      { italian: 'Ciao', polish: 'cześć', line: 2 },
      { italian: 'Sì; certo', polish: 'Tak, oczywiście', line: 6 },
      { italian: 'prego', polish: 'proszę', line: 7 },
    ]);
    expect(report.skipped).toEqual([
      { line: 3, reason: 'brak tekstu w kolumnie polish' },
      { line: 4, reason: 'pusty wiersz' },
    ]);
    expect(report.duplicates).toEqual([{ line: 5, firstLine: 2 }]);
    expect(report.totalRows).toBe(6);
  });

  it('wczytuje wartości w cudzysłowach z przecinkiem', () => {
    const report = parseText('italian,polish\n"Sì, certo","Tak, oczywiście"\n');

    expect(report.pairs).toEqual([{ italian: 'Sì, certo', polish: 'Tak, oczywiście', line: 2 }]);
  });

  it('ignoruje dodatkowe kolumny i kolejność kolumn', () => {
    const report = parseText('notes,polish,italian\nx,cześć,ciao\n');

    expect(report.pairs).toEqual([{ italian: 'ciao', polish: 'cześć', line: 2 }]);
  });

  it('traktuje ten sam wyraz włoski z innym tłumaczeniem jako osobną parę', () => {
    const report = parseText('italian,polish\nprego,proszę\nprego,nie ma za co\n');

    expect(report.pairs).toHaveLength(2);
    expect(report.duplicates).toEqual([]);
  });
});

describe('parseWordsCsv — blokady importu', () => {
  it('MISSING_COLUMNS wymienia brakującą kolumnę', () => {
    const report = parseFile('tests/fixtures/missing-polish.csv');

    expect(report.status).toBe('blocked');
    expect(report.blockingError?.code).toBe('MISSING_COLUMNS');
    expect(report.blockingError?.message).toContain('polish');
  });

  it('EMPTY_FILE dla pustego pliku', () => {
    expect(parseText('').blockingError?.code).toBe('EMPTY_FILE');
    expect(parseText('﻿  \n\n').blockingError?.code).toBe('EMPTY_FILE');
  });

  it('NO_VALID_ROWS dla samego nagłówka i samych błędnych wierszy', () => {
    expect(parseFile('tests/fixtures/header-only.csv').blockingError?.code).toBe('NO_VALID_ROWS');

    const report = parseFile('tests/fixtures/all-invalid.csv');
    expect(report.blockingError?.code).toBe('NO_VALID_ROWS');
    expect(report.skipped).toHaveLength(2);
  });

  it('FILE_TOO_LARGE dla pliku powyżej 1 MB', () => {
    const report = parseWordsCsv('italian,polish\nciao,cześć\n', { fileSize: MAX_FILE_BYTES + 1 });

    expect(report.blockingError?.code).toBe('FILE_TOO_LARGE');
  });

  it(`TOO_MANY_ROWS dla ${MAX_ROWS + 1} wierszy`, () => {
    expect(parseText(generateCsv(MAX_ROWS + 1)).blockingError?.code).toBe('TOO_MANY_ROWS');
  });

  it('UNREADABLE dla pliku binarnego', () => {
    expect(parseText('italian,polish\n\u0000\u0001\u0002').blockingError?.code).toBe('UNREADABLE');
  });
});

describe('parseWordsCsv — wydajność (SC-003)', () => {
  it(`${MAX_ROWS} wierszy w mniej niż 2 s`, () => {
    const csv = generateCsv(MAX_ROWS);
    const start = performance.now();

    const report = parseText(csv);

    expect(performance.now() - start).toBeLessThan(2000);
    expect(report.pairs).toHaveLength(MAX_ROWS);
  });
});
