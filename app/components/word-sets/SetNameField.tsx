'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isNameTaken, suggestUniqueName, validateSetName } from '@/lib/word-sets/set-name';
import { MAX_SET_NAME_LENGTH } from '@/lib/word-sets/types';

interface SetNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  existingNames: string[];
  showValidation: boolean;
}

export function SetNameField({ value, onChange, existingNames, showValidation }: SetNameFieldProps) {
  const validation = validateSetName(value);
  const taken = validation.ok && isNameTaken(value, existingNames);
  const suggestion = taken ? suggestUniqueName(value, existingNames) : null;
  const errorMessage = showValidation && !validation.ok ? validation.message : null;

  return (
    <div className="space-y-2">
      <Label htmlFor="set-name">Nazwa zestawu</Label>
      <Input
        id="set-name"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_SET_NAME_LENGTH}
        className="h-11"
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage || suggestion ? 'set-name-hint' : undefined}
      />
      {errorMessage && (
        <p id="set-name-hint" role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      {suggestion && (
        <div id="set-name-hint" className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
          <p className="text-muted-foreground">Zestaw o tej nazwie już istnieje.</p>
          <Button type="button" variant="outline" className="h-11" onClick={() => onChange(suggestion)}>
            Użyj „{suggestion}”
          </Button>
        </div>
      )}
    </div>
  );
}
