export type StudyModeId = 'flashcards' | 'word-tower' | 'matching' | 'grammar-runner';

export interface StudyMode {
  id: StudyModeId;
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  minWords: number;
}

export type TileState = 'available' | 'coming-soon' | 'too-few-words';

/** Kolejność kafelków na panelu zestawu. Nowy tryb włącza się zmianą `status` i wpisem w `modeHref`. */
export const STUDY_MODES: readonly StudyMode[] = [
  {
    id: 'flashcards',
    name: 'Fiszki',
    description: 'Odwracaj karty i oceniaj, które słówka już znasz.',
    status: 'available',
    minWords: 1,
  },
  {
    id: 'word-tower',
    name: 'Italian Word Tower',
    description: 'Zestrzeliwuj spadające klocki z pasującym tłumaczeniem.',
    status: 'coming-soon',
    minWords: 4,
  },
  {
    id: 'matching',
    name: 'Dopasowywanie na czas',
    description: 'Łącz pary polski – włoski, zanim skończy się czas.',
    status: 'coming-soon',
    minWords: 4,
  },
  {
    id: 'grammar-runner',
    name: 'Grammar Runner',
    description: 'Biegnij przez zdania i wybieraj poprawne słowa.',
    status: 'coming-soon',
    minWords: 4,
  },
];

export const STUDY_MODE_IDS: readonly StudyModeId[] = STUDY_MODES.map((mode) => mode.id);

export function getTileState(mode: StudyMode, wordCount: number): TileState {
  if (mode.status === 'coming-soon') return 'coming-soon';
  return wordCount < mode.minWords ? 'too-few-words' : 'available';
}

export function modeHref(modeId: StudyModeId, setId: string): string | null {
  switch (modeId) {
    case 'flashcards':
      return `/flashcards?set=${encodeURIComponent(setId)}`;
    default:
      return null;
  }
}
