'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWordSets } from '@/hooks/use-word-sets';
import { downloadCsv } from '@/lib/word-sets/download';
import { parseWordsCsv } from '@/lib/word-sets/parse-csv';
import { StorageError } from '@/lib/word-sets/repository';
import { TEMPLATE_CSV, TEMPLATE_FILE_NAME } from '@/lib/word-sets/sample';
import { defaultSetName, validateSetName } from '@/lib/word-sets/set-name';
import type { ImportReport } from '@/lib/word-sets/types';
import { CsvFilePicker, type PickedFile } from './CsvFilePicker';
import { ImportPreview } from './ImportPreview';
import { SetNameField } from './SetNameField';

type WizardState = { step: 'pick' } | { step: 'preview'; report: ImportReport; fileName: string };

export function ImportWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const { sets, createFromImport } = useWordSets();
  const [state, setState] = useState<WizardState>({ step: 'pick' });
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleFile = ({ text, size, name: fileName }: PickedFile) => {
    setState({ step: 'preview', report: parseWordsCsv(text, { fileSize: size }), fileName });
    setName(defaultSetName(fileName));
    setNameTouched(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (state.step !== 'preview' || state.report.status !== 'ok') return;
    setNameTouched(true);
    if (!validateSetName(name).ok) return;

    setSaving(true);
    setSaveError(null);
    try {
      const set = await createFromImport(name, state.report, state.fileName);
      toast({ title: `Zapisano zestaw „${set.name}”` });
      router.push('/');
    } catch (err) {
      setSaveError(err instanceof StorageError ? err.message : 'Nie udało się zapisać zestawu. Spróbuj ponownie.');
      setSaving(false);
    }
  };

  if (state.step === 'pick') {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Plik musi mieć w pierwszym wierszu kolumny <code>italian</code> i <code>polish</code>. Przed zapisem zobaczysz
          podgląd słówek.
        </p>
        <CsvFilePicker onFile={handleFile} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => downloadCsv(TEMPLATE_CSV, TEMPLATE_FILE_NAME)}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Pobierz wzór CSV
          </Button>
          <Button type="button" variant="ghost" className="h-11" onClick={() => router.push('/')}>
            Anuluj
          </Button>
        </div>
      </div>
    );
  }

  const { report, fileName } = state;
  const canSave = report.status === 'ok' && !saving;

  return (
    <div className="space-y-6">
      <p className="break-words text-sm text-muted-foreground">
        Plik: <span className="font-medium text-foreground">{fileName}</span>
      </p>

      <ImportPreview report={report} />

      {report.status === 'ok' && (
        <SetNameField
          value={name}
          onChange={(value) => {
            setName(value);
            setNameTouched(true);
          }}
          existingNames={sets.map((set) => set.name)}
          showValidation={nameTouched}
        />
      )}

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {report.status === 'ok' && (
          <Button type="button" className="h-11" onClick={handleSave} disabled={!canSave}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Zapisz zestaw
          </Button>
        )}
        <CsvFilePicker onFile={handleFile} label="Wybierz inny plik" />
        <Button type="button" variant="ghost" className="h-11" onClick={() => router.push('/')} disabled={saving}>
          Anuluj
        </Button>
      </div>
    </div>
  );
}
