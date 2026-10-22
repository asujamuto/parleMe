import type { ImportedPair, WordEntry, WordSet, WordSetSource } from './types';

interface BuildWordSetInput {
  name: string;
  pairs: Pick<ImportedPair, 'italian' | 'polish'>[];
  fileName: string | null;
  now: Date;
  newId: () => string;
  source?: WordSetSource;
}

export function buildWordSet({ name, pairs, fileName, now, newId, source = 'csv' }: BuildWordSetInput): {
  set: WordSet;
  entries: WordEntry[];
} {
  const timestamp = now.toISOString();
  const set: WordSet = {
    id: newId(),
    name: name.trim(),
    source,
    sourceFileName: fileName,
    entryCount: pairs.length,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const entries = pairs.map<WordEntry>((pair, position) => ({
    id: newId(),
    setId: set.id,
    italian: pair.italian,
    polish: pair.polish,
    position,
  }));

  return { set, entries };
}
