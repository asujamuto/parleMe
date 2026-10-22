'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ModeTiles } from '@/app/components/modes/ModeTiles';
import { DeleteSetDialog } from '@/app/components/word-sets/DeleteSetDialog';
import { RenameSetDialog } from '@/app/components/word-sets/RenameSetDialog';
import { useLastMode } from '@/hooks/use-last-mode';
import { useToast } from '@/hooks/use-toast';
import { useWordProgress } from '@/hooks/use-word-progress';
import { useWordSet, useWordSetActions, useWordSets } from '@/hooks/use-word-sets';
import { countMastered } from '@/lib/progress/progress';
import { formatWordCount } from '@/lib/word-sets/format';
import { StorageError } from '@/lib/word-sets/repository';

const dateFormat = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

export default function SetPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Zestawy
        </Link>
        <Suspense fallback={<LoadingState />}>
          <SetContent />
        </Suspense>
      </div>
    </main>
  );
}

function SetContent() {
  const setId = useSearchParams().get('id') ?? '';
  const router = useRouter();
  const { toast } = useToast();
  const { data, loading, error, reload } = useWordSet(setId);
  const { sets } = useWordSets();
  const { progress } = useWordProgress(setId);
  const { renameSet, deleteSet } = useWordSetActions();
  const { lastModeId } = useLastMode(setId);

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

  const { set, entries } = data;
  const mastered = countMastered(Object.values(progress));

  const handleDelete = async () => {
    try {
      await deleteSet(set.id);
      toast({ title: `Usunięto zestaw „${set.name}”` });
      router.push('/');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Nie udało się usunąć zestawu',
        description: err instanceof StorageError ? err.message : undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="break-words text-2xl font-bold sm:text-3xl">{set.name}</h1>
        <p className="text-muted-foreground">
          {formatWordCount(set.entryCount)} · dodano {dateFormat.format(new Date(set.createdAt))}
        </p>
        <p className="text-sm font-medium">
          Opanowane: {mastered} / {set.entryCount}
        </p>
      </header>

      <ModeTiles setId={set.id} wordCount={entries.length} lastModeId={lastModeId} />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <RenameSetDialog
          set={set}
          otherNames={sets.filter((other) => other.id !== set.id).map((other) => other.name)}
          onRename={(name) => renameSet(set.id, name)}
          onRenamed={(renamed) => {
            toast({ title: `Zmieniono nazwę na „${renamed.name}”` });
            reload();
          }}
        />
        <DeleteSetDialog set={set} onConfirm={handleDelete} />
      </div>

      <section aria-labelledby="entries-heading" className="space-y-2">
        <h2 id="entries-heading" className="text-xl font-semibold">
          Słówka
        </h2>
        <ul className="divide-y rounded-md border">
          {entries.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:gap-4">
              <span lang="it" className="break-words font-medium sm:w-1/2">
                {entry.italian}
              </span>
              <span className="break-words text-muted-foreground sm:w-1/2">{entry.polish}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Wczytywanie zestawu">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-64" />
    </div>
  );
}
