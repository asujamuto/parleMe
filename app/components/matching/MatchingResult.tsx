'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatSeconds } from '@/lib/matching/game';
import type { RecordOutcome } from '@/lib/preferences/matching-records';
import type { WordEntry } from '@/lib/word-sets/types';

interface MatchingResultProps {
  timeMs: number;
  record: Pick<RecordOutcome, 'isNewRecord' | 'bestMs'>;
  mistakes: number;
  errorPairs: WordEntry[];
  exitHref: string;
  onRestart: () => void;
}

export function MatchingResult({ timeMs, record, mistakes, errorPairs, exitHref, onRestart }: MatchingResultProps) {
  return (
    <section aria-labelledby="matching-result-heading" className="space-y-6">
      <h2 id="matching-result-heading" className="text-2xl font-bold">
        Wszystkie pary dopasowane!
      </h2>

      <dl className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-md border p-3">
          <dt className="text-xs text-muted-foreground">Czas</dt>
          <dd className="text-3xl font-bold tabular-nums">{formatSeconds(timeMs)}</dd>
          <dd className={record.isNewRecord ? 'mt-1 text-sm font-bold text-primary' : 'mt-1 text-xs text-muted-foreground'}>
            {record.isNewRecord ? 'Nowy rekord!' : `Rekord: ${formatSeconds(record.bestMs)}`}
          </dd>
        </div>
        <div className="rounded-md border p-3">
          <dt className="text-xs text-muted-foreground">Błędy</dt>
          <dd className="text-3xl font-bold tabular-nums">{mistakes}</dd>
        </div>
      </dl>

      {errorPairs.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Pary z błędami</h3>
          <ul className="divide-y rounded-md border">
            {errorPairs.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:gap-4">
                <span lang="it" className="break-words font-medium sm:w-1/2">
                  {entry.italian}
                </span>
                <span className="break-words text-muted-foreground sm:w-1/2">{entry.polish}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="h-11" onClick={onRestart} autoFocus>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Zagraj jeszcze raz
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link href={exitHref}>Wróć do zestawu</Link>
        </Button>
      </div>
    </section>
  );
}
