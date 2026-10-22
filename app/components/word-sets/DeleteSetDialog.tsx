'use client';

import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { formatWordCount } from '@/lib/word-sets/format';
import type { WordSet } from '@/lib/word-sets/types';

interface DeleteSetDialogProps {
  set: WordSet;
  onConfirm: () => void;
}

export function DeleteSetDialog({ set, onConfirm }: DeleteSetDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" className="h-11 text-destructive hover:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Usuń
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words">Usunąć zestaw „{set.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Usunie {formatWordCount(set.entryCount)} i postęp nauki tego zestawu. Tej operacji nie można cofnąć.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="h-11">Anuluj</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: 'destructive', className: 'h-11' })} onClick={onConfirm}>
            Usuń zestaw
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
