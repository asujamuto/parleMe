import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ImportWizard } from '@/app/components/word-sets/ImportWizard';

export default function ImportPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Wróć do zestawów
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">Importuj zestaw z CSV</h1>
        <ImportWizard />
      </div>
    </main>
  );
}
