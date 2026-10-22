'use client';

import { useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PickedFile {
  text: string;
  size: number;
  name: string;
}

interface CsvFilePickerProps {
  onFile: (file: PickedFile) => void;
  label?: string;
}

export function CsvFilePicker({ onFile, label = 'Wybierz plik CSV' }: CsvFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      setError(null);
      onFile({ text, size: file.size, name: file.name });
    } catch {
      setError('Nie udało się odczytać pliku.');
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <Button type="button" className="h-11 w-full sm:w-auto" onClick={() => inputRef.current?.click()}>
        <FileUp className="mr-2 h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
