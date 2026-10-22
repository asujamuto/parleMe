import { STUDY_MODE_IDS, type StudyModeId } from '@/lib/modes/catalog';

export const LAST_MODE_KEY = 'parleme.lastModeBySet';

/** Ostatnio uruchomiony tryb każdego zestawu; brak/uszkodzone dane → `{}`. */
export function loadLastModes(storage?: Pick<Storage, 'getItem'>): Record<string, StudyModeId> {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(LAST_MODE_KEY) ?? '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, StudyModeId] =>
        STUDY_MODE_IDS.includes(entry[1] as StudyModeId),
      ),
    );
  } catch {
    return {};
  }
}

export function saveLastMode(setId: string, modeId: StudyModeId, storage?: Pick<Storage, 'getItem' | 'setItem'>): void {
  try {
    storage?.setItem(LAST_MODE_KEY, JSON.stringify({ ...loadLastModes(storage), [setId]: modeId }));
  } catch {
    // Oznaczenie „Ostatnio” nie zostanie zapamiętane — nauka działa dalej.
  }
}

export function clearLastMode(setId: string, storage?: Pick<Storage, 'getItem' | 'setItem'>): void {
  try {
    const modes = loadLastModes(storage);
    if (!(setId in modes)) return;
    delete modes[setId];
    storage?.setItem(LAST_MODE_KEY, JSON.stringify(modes));
  } catch {
    // Ignorowane — wpis usuniętego zestawu nie jest nigdzie wyświetlany.
  }
}
