'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDuration, type SessionSummary as Summary } from '@/lib/flashcards/session';

interface SessionSummaryProps {
  summary: Summary;
  onRestart: () => void;
}

export function SessionSummary({ summary, onRestart }: SessionSummaryProps) {
  return (
    <section aria-labelledby="summary-heading" className="space-y-6">
      <h2 id="summary-heading" className="text-2xl font-bold">
        Runda ukończona!
      </h2>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Znane od razu" value={String(summary.knownFirstTry)} />
        <Stat label="Powtórzone" value={String(summary.repeated.length)} />
        <Stat label="Czas" value={formatDuration(summary.durationMs)} />
      </dl>

      {summary.repeated.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Słówka do powtórki</h3>
          <ul className="divide-y rounded-md border">
            {summary.repeated.map((entry) => (
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
          Jeszcze raz
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link href="/">Wróć do zestawów</Link>
        </Button>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-bold">{value}</dd>
    </div>
  );
}
