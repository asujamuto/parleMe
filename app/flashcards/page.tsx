'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlashcardSession } from '@/app/components/flashcards/FlashcardSession';
import { useFlashcardDirection } from '@/hooks/use-flashcard-direction';
import { useLastMode } from '@/hooks/use-last-mode';
import { useLastStudiedSet } from '@/hooks/use-last-studied-set';
import { useWordProgress } from '@/hooks/use-word-progress';
import { useWordSet } from '@/hooks/use-word-sets';

export default function FlashcardsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl space-y-6 px-4 py-6 sm:py-8">
        <Suspense fallback={<LoadingState />}>
          <FlashcardsContent />
        </Suspense>
      </div>
    </main>
  );
}

function FlashcardsContent() {
  const setId = useSearchParams().get('set') ?? '';
  const { data, loading, error } = useWordSet(setId);
  const { progress, loading: progressLoading, saveRating, storageWarning } = useWordProgress(setId);
  const { direction, ready: directionReady, setDirection } = useFlashcardDirection();
  const { markStudied } = useLastStudiedSet();
  const { markModeUsed } = useLastMode(setId);
  const loadedSetId = data?.set.id;
  const hubHref = `/set?id=${encodeURIComponent(setId)}`;

  useEffect(() => {
    if (!loadedSetId) return;
    markStudied(loadedSetId);
    markModeUsed('flashcards');
  }, [loadedSetId, markStudied, markModeUsed]);

  const backLink = (
    <Link
      href={loadedSetId ? hubHref : '/'}
      className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
      {loadedSetId ? 'Zestaw' : 'Zestawy'}
    </Link>
  );

  if (loading || progressLoading || !directionReady) return <LoadingState />;

  if (error) {
    return (
      <>
        {backLink}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </>
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

  return (
    <>
      {backLink}
      <h1 className="break-words text-2xl font-bold">{data.set.name}</h1>
      {storageWarning && (
        <Alert>
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{storageWarning}</AlertDescription>
        </Alert>
      )}
      <FlashcardSession
        key={data.set.id}
        set={data.set}
        entries={data.entries}
        progress={progress}
        onRate={saveRating}
        initialDirection={direction}
        onDirectionChange={setDirection}
        exitHref={hubHref}
      />
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
