import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatWordCount } from '@/lib/word-sets/format';
import type { WordSet } from '@/lib/word-sets/types';

const dateFormat = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

interface WordSetListProps {
  sets: WordSet[];
  masteredCounts?: Record<string, number>;
  lastStudiedSetId?: string | null;
}

export function WordSetList({ sets, masteredCounts = {}, lastStudiedSetId = null }: WordSetListProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2" aria-label="Twoje zestawy">
      {sets.map((set) => (
        <li key={set.id}>
          <Card className="flex h-full flex-col">
            <CardHeader className="flex-1 space-y-1 p-4">
              {set.id === lastStudiedSetId && (
                <Badge variant="secondary" className="w-fit">
                  Ostatnio uczony
                </Badge>
              )}
              <CardTitle className="break-words text-lg">
                <Link
                  href={`/set?id=${encodeURIComponent(set.id)}`}
                  className="inline-flex min-h-[44px] items-center rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {set.name}
                </Link>
              </CardTitle>
              <CardDescription>
                {formatWordCount(set.entryCount)} · dodano {dateFormat.format(new Date(set.createdAt))}
              </CardDescription>
              <p className="text-sm font-medium">
                Opanowane: {masteredCounts[set.id] ?? 0} / {set.entryCount}
              </p>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="h-11 w-full sm:w-auto">
                <Link href={`/set?id=${encodeURIComponent(set.id)}`} aria-label={`Ucz się: ${set.name}`}>
                  <GraduationCap className="mr-2 h-4 w-4" aria-hidden="true" />
                  Ucz się
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}
