import Link from 'next/link';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatWordCount } from '@/lib/word-sets/format';
import type { WordSet } from '@/lib/word-sets/types';

const dateFormat = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

interface WordSetListProps {
  sets: WordSet[];
  masteredCounts?: Record<string, number>;
}

export function WordSetList({ sets, masteredCounts = {} }: WordSetListProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2" aria-label="Twoje zestawy">
      {sets.map((set) => (
        <li key={set.id}>
          <Card className="flex h-full flex-col">
            <CardHeader className="flex-1 space-y-1 p-4">
              <CardTitle className="break-words text-lg">{set.name}</CardTitle>
              <CardDescription>
                {formatWordCount(set.entryCount)} · dodano {dateFormat.format(new Date(set.createdAt))}
              </CardDescription>
              <p className="text-sm font-medium">
                Opanowane: {masteredCounts[set.id] ?? 0} / {set.entryCount}
              </p>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="h-11 w-full sm:w-auto">
                <Link href={`/flashcards?set=${encodeURIComponent(set.id)}`} aria-label={`Fiszki: ${set.name}`}>
                  <Layers className="mr-2 h-4 w-4" aria-hidden="true" />
                  Fiszki
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}
