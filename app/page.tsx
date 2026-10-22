'use client';

import Link from 'next/link';
import { AlertCircle, FileUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/app/components/word-sets/EmptyState';
import { WordSetList } from '@/app/components/word-sets/WordSetList';
import { useMasteredCounts } from '@/hooks/use-word-progress';
import { useWordSets } from '@/hooks/use-word-sets';

export default function Home() {
  const { sets, loading, error } = useWordSets();
  const masteredCounts = useMasteredCounts();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">parleMe</h1>
          {sets.length > 0 && (
            <Button asChild className="h-11">
              <Link href="/import">
                <FileUp className="mr-2 h-4 w-4" aria-hidden="true" />
                Importuj CSV
              </Link>
            </Button>
          )}
        </header>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Wczytywanie zestawów">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : sets.length > 0 ? (
          <section aria-labelledby="sets-heading" className="space-y-3">
            <h2 id="sets-heading" className="text-xl font-semibold">
              Twoje zestawy
            </h2>
            <WordSetList sets={sets} masteredCounts={masteredCounts} />
          </section>
        ) : (
          !error && <EmptyState />
        )}
      </div>
    </main>
  );
}
