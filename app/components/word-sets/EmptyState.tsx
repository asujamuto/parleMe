'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileUp, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddSample: () => Promise<void>;
}

export function EmptyState({ onAddSample }: EmptyStateProps) {
  const [adding, setAdding] = useState(false);

  const handleAddSample = async () => {
    setAdding(true);
    try {
      await onAddSample();
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-dashed p-6 text-center">
      <h2 className="text-xl font-semibold">Nie masz jeszcze żadnych zestawów</h2>
      <p className="text-muted-foreground">
        Zaimportuj plik CSV z kolumnami <code>italian</code> i <code>polish</code> albo wypróbuj aplikację na zestawie
        przykładowym.
      </p>
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <Button asChild className="h-11">
          <Link href="/import">
            <FileUp className="mr-2 h-4 w-4" aria-hidden="true" />
            Importuj CSV
          </Link>
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={handleAddSample} disabled={adding}>
          {adding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Dodaj zestaw przykładowy
        </Button>
      </div>
    </div>
  );
}
