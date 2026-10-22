# Data Model: Panel zestawu

## StudyMode (stała, `lib/modes/catalog.ts`)

| Pole | Typ | Wartości (w tej funkcji) |
|------|-----|--------------------------|
| `id` | `'flashcards' \| 'word-tower' \| 'matching' \| 'grammar-runner'` | kolejność: flashcards, word-tower, matching, grammar-runner |
| `name` | string | „Fiszki”, „Italian Word Tower”, „Dopasowywanie na czas”, „Grammar Runner” |
| `description` | string | jedno zdanie po polsku |
| `status` | `'available' \| 'coming-soon'` | tylko `flashcards` = `available` |
| `minWords` | number | flashcards 1; pozostałe 4 |

Stan kafelka (`getTileState`): `coming-soon` gdy `status = coming-soon`; inaczej
`too-few-words` gdy `wordCount < minWords`; inaczej `available`.

Adres trybu (`modeHref`): `flashcards` → `/flashcards?set=<encodeURIComponent(setId)>`.

## Ostatni tryb zestawu (`localStorage`)

Klucz `parleme.lastModeBySet` → JSON `{ [setId: string]: StudyModeId }`. Błąd odczytu, brak
klucza albo niepoprawny JSON → `{}`; wartości spoza `StudyModeId` pomijane.
