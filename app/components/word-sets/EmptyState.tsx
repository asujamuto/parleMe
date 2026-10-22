import Link from 'next/link';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <div className="space-y-4 rounded-lg border border-dashed p-6 text-center">
      <h2 className="text-xl font-semibold">Nie masz jeszcze żadnych zestawów</h2>
      <p className="text-muted-foreground">
        Zaimportuj plik CSV z kolumnami <code>italian</code> i <code>polish</code>, a słówka od razu pojawią się
        tutaj.
      </p>
      <Button asChild className="h-11">
        <Link href="/import">
          <FileUp className="mr-2 h-4 w-4" aria-hidden="true" />
          Importuj CSV
        </Link>
      </Button>
    </div>
  );
}
