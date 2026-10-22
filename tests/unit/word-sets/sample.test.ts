import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { parseWordsCsv } from '@/lib/word-sets/parse-csv';
import {
  SAMPLE_CSV,
  SAMPLE_SET_NAME,
  TEMPLATE_CSV,
  TEMPLATE_FILE_NAME,
  buildSampleSet,
} from '@/lib/word-sets/sample';

const sampleDir = path.resolve(__dirname, '../../../app/data/2ita1');

function parseText(text: string) {
  return parseWordsCsv(text, { fileSize: Buffer.byteLength(text) });
}

describe('SAMPLE_CSV', () => {
  it('zawiera 57 poprawnych par bez pominięć i powtórzeń', () => {
    const report = parseText(SAMPLE_CSV);

    expect(report.status).toBe('ok');
    expect(report.pairs).toHaveLength(57);
    expect(report.skipped).toEqual([]);
    expect(report.duplicates).toEqual([]);
  });

  it('odpowiada plikom ITA5 z app/data/2ita1', () => {
    const fromFiles = readdirSync(sampleDir)
      .filter((file) => file.endsWith('.csv'))
      .sort()
      .flatMap((file) => {
        const buffer = readFileSync(path.join(sampleDir, file));
        return parseWordsCsv(buffer.toString('utf8'), { fileSize: buffer.byteLength }).pairs;
      })
      .map(({ italian, polish }) => ({ italian, polish }));

    expect(parseText(SAMPLE_CSV).pairs.map(({ italian, polish }) => ({ italian, polish }))).toEqual(fromFiles);
  });
});

describe('TEMPLATE_CSV', () => {
  it('importuje się bez pominiętych wierszy', () => {
    const report = parseText(TEMPLATE_CSV);

    expect(report.status).toBe('ok');
    expect(report.pairs.length).toBeGreaterThanOrEqual(4);
    expect(report.skipped).toEqual([]);
    expect(TEMPLATE_FILE_NAME).toBe('parleme-wzor.csv');
  });
});

describe('buildSampleSet', () => {
  it('tworzy zestaw przykładowy ze źródłem sample', () => {
    let i = 0;
    const { set, entries } = buildSampleSet({ now: new Date('2026-10-22T10:00:00.000Z'), newId: () => `id-${++i}` });

    expect(set).toMatchObject({
      name: SAMPLE_SET_NAME,
      source: 'sample',
      sourceFileName: null,
      entryCount: 57,
    });
    expect(entries).toHaveLength(57);
    expect(entries.every((entry) => entry.setId === set.id)).toBe(true);
  });
});
