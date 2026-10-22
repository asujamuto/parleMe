'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlashcardSession } from '@/app/components/flashcards/FlashcardSession';
import { useWordSet } from '@/hooks/use-word-sets';

export default function FlashcardsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl space-y-6 px-4 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Zestawy
        </Link>
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

  return (
    <>
      <h1 className="break-words text-2xl font-bold">{data.set.name}</h1>
      <FlashcardSession key={data.set.id} set={data.set} entries={data.entries} />
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
