'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Timer } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchingGame } from '@/app/components/matching/MatchingGame';
import { useLastMode } from '@/hooks/use-last-mode';
import { useMatchingRecord } from '@/hooks/use-matching-record';
import { useLastStudiedSet } from '@/hooks/use-last-studied-set';
import { useWordProgress } from '@/hooks/use-word-progress';
import { useWordSet } from '@/hooks/use-word-sets';
import { MIN_PAIRS, formatSeconds, selectPairs, type MatchingRoundResult } from '@/lib/matching/game';
import type { WordEntry } from '@/lib/word-sets/types';

export default function MatchingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:py-8">
        <Suspense fallback={<LoadingState />}>
          <MatchingContent />
        </Suspense>
      </div>
    </main>
  );
}

function MatchingContent() {
  const setId = useSearchParams().get('set') ?? '';
  const { data, loading, error } = useWordSet(setId);
  const { markStudied } = useLastStudiedSet();
  const { markModeUsed } = useLastMode(setId);
  const { bestMs, submit } = useMatchingRecord(setId);
  const { progress, loading: progressLoading, saveRating, storageWarning } = useWordProgress(setId);
  const [round, setRound] = useState<{ key: number; pairs: WordEntry[] } | null>(null);
  const loadedSetId = data?.set.id;
  const hubHref = `/set?id=${encodeURIComponent(setId)}`;

  useEffect(() => {
    if (!loadedSetId) return;
    markStudied(loadedSetId);
    markModeUsed('matching');
  }, [loadedSetId, markStudied, markModeUsed]);

  const handleFinished = useCallback(
    (result: MatchingRoundResult) => {
      result.ratings.forEach(saveRating);
      return submit(result.timeMs);
    },
    [saveRating, submit],
  );

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Nie znaleziono zestawu</h1>
        <p className="text-muted-foreground">Ten zestaw nie istnieje albo został usunięty.</p>
        <Button asChild className="h-11">
          <Link href="/">Wróć do zestawów</Link>
        </Button>
      </div>
    );
  }

  const startRound = () =>
    setRound((previous) => ({ key: (previous?.key ?? 0) + 1, pairs: selectPairs(data.entries, { progress }) }));
  const canPlay = round === null || round.pairs.length >= MIN_PAIRS;

  return (
    <>
      <Link
        href={hubHref}
        className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Zestaw
      </Link>
      <h1 className="break-words text-2xl font-bold">Dopasowywanie na czas · {data.set.name}</h1>
      {storageWarning && (
        <Alert>
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{storageWarning}</AlertDescription>
        </Alert>
      )}

      {round && canPlay ? (
        <MatchingGame key={round.key} pairs={round.pairs} exitHref={hubHref} onRestart={startRound} onFinished={handleFinished} />
      ) : (
        <div className="space-y-4 rounded-xl border p-6 text-center">
          <Timer className="mx-auto h-10 w-10" aria-hidden="true" />
          <p>Znajdź pary: słówko włoskie i jego polski odpowiednik. Każdy błąd to +1 s.</p>
          {bestMs !== null && <p className="font-semibold">Rekord: {formatSeconds(bestMs)}</p>}
          {!canPlay && (
            <p role="alert" className="text-sm text-destructive">
              Za mało różnych słówek w zestawie, aby zagrać.
            </p>
          )}
          <Button type="button" className="h-12 px-8 text-base" onClick={startRound} disabled={!canPlay || progressLoading} autoFocus>
            Start
          </Button>
        </div>
      )}
    </>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Wczytywanie zestawu">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-64" />
    </div>
  );
}
