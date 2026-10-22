'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ImportReport } from '@/lib/word-sets/types';

const INITIAL_VISIBLE_PAIRS = 100;

const FORMAT_EXAMPLE = `italian,polish
ciao,cześć
grazie,dziękuję`;

export function ImportPreview({ report }: { report: ImportReport }) {
  const [showAll, setShowAll] = useState(false);
  const visiblePairs = showAll ? report.pairs : report.pairs.slice(0, INITIAL_VISIBLE_PAIRS);
  const hiddenCount = report.pairs.length - visiblePairs.length;

  return (
    <div className="space-y-6">
      {report.blockingError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Nie można zaimportować pliku</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{report.blockingError.message}</p>
            <p>Przykład poprawnego pliku:</p>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">{FORMAT_EXAMPLE}</pre>
          </AlertDescription>
        </Alert>
      )}

      {report.status === 'ok' && (
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Pary" value={report.pairs.length} />
          <Stat label="Pominięte" value={report.skipped.length} />
          <Stat label="Powtórzenia" value={report.duplicates.length} />
        </dl>
      )}

      {(report.skipped.length > 0 || report.duplicates.length > 0) && (
        <section aria-labelledby="skipped-heading" className="space-y-2">
          <h3 id="skipped-heading" className="font-semibold">
            Pominięte wiersze
          </h3>
          <ul className="space-y-1 rounded-md border p-3 text-sm">
            {report.skipped.map(({ line, reason }) => (
              <li key={`s${line}`}>
                Wiersz {line}: {reason}
              </li>
            ))}
            {report.duplicates.map(({ line, firstLine }) => (
              <li key={`d${line}`}>
                Wiersz {line}: powtórzenie wiersza {firstLine}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.pairs.length > 0 && (
        <section aria-labelledby="pairs-heading" className="space-y-2">
          <h3 id="pairs-heading" className="font-semibold">
            Słówka
          </h3>
          <ul className="divide-y rounded-md border">
            {visiblePairs.map(({ italian, polish, line }) => (
              <li key={line} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:gap-4">
                <span lang="it" className="break-words font-medium sm:w-1/2">
                  {italian}
                </span>
                <span className="break-words text-muted-foreground sm:w-1/2">{polish}</span>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <Button type="button" variant="outline" className="h-11 w-full" onClick={() => setShowAll(true)}>
              Pokaż wszystkie ({report.pairs.length})
            </Button>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-bold">{value}</dd>
    </div>
  );
}
