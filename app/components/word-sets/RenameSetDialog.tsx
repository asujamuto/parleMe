'use client';

import { useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StorageError } from '@/lib/word-sets/repository';
import { validateSetName } from '@/lib/word-sets/set-name';
import type { WordSet } from '@/lib/word-sets/types';
import { SetNameField } from './SetNameField';

interface RenameSetDialogProps {
  set: WordSet;
  /** Nazwy pozostałych zestawów (bez bieżącego). */
  otherNames: string[];
  onRename: (name: string) => Promise<WordSet | null>;
  onRenamed: (set: WordSet) => void;
}

export function RenameSetDialog({ set, otherNames, onRename, onRenamed }: RenameSetDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(set.name);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (saving) return;
    setOpen(next);
    if (next) {
      setName(set.name);
      setTouched(false);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!validateSetName(name).ok) return;

    setSaving(true);
    setError(null);
    try {
      const renamed = await onRename(name);
      if (!renamed) {
        setError('Ten zestaw już nie istnieje.');
        return;
      }
      setOpen(false);
      onRenamed(renamed);
    } catch (err) {
      setError(err instanceof StorageError || err instanceof Error ? err.message : 'Nie udało się zmienić nazwy.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-11">
          <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
          Zmień nazwę
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Zmień nazwę zestawu</DialogTitle>
            <DialogDescription>Słówka i postęp nauki zostaną bez zmian.</DialogDescription>
          </DialogHeader>
          <SetNameField
            value={name}
            onChange={(value) => {
              setName(value);
              setTouched(true);
            }}
            existingNames={otherNames}
            showValidation={touched}
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" className="h-11" onClick={() => handleOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" className="h-11" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
