# Contract: rdzeń zestawów słówek (moduły współdzielone przez tryby)

Wewnętrzny interfejs, z którego korzystają ekran importu, lista zestawów i przyszłe tryby
nauki (zasada IV). Sygnatury opisowe — szczegóły typów w `data-model.md`.

## Czyste funkcje (`lib/word-sets/`)

| Funkcja | Wejście | Wyjście | Uwagi |
|---------|---------|---------|-------|
| `parseWordsCsv(text, { fileSize })` | treść pliku, rozmiar w bajtach | `ImportReport` | bez efektów ubocznych; limity, nagłówki, powtórzenia |
| `defaultSetName(fileName)` | nazwa pliku | string | bez rozszerzenia, `trim`, przycięta do 60 znaków |
| `validateSetName(name)` | string | `{ ok: true } \| { ok: false, message }` | 1–60 znaków po `trim` |
| `suggestUniqueName(name, existingNames)` | string, string[] | string | `"Nazwa (2)"`, `"Nazwa (3)"`… gdy kolizja |
| `buildWordSet({ name, pairs, fileName, now, newId })` | dane z podglądu | `{ set: WordSet, entries: WordEntry[] }` | `now` i `newId` wstrzykiwane |

## Repozytorium (`WordSetRepository`)

| Metoda | Zwraca | Zachowanie |
|--------|--------|------------|
| `listSets()` | `Promise<WordSet[]>` | posortowane po `createdAt` malejąco |
| `getSet(id)` | `Promise<{ set, entries } \| null>` | słówka posortowane po `position` |
| `createSet(set, entries)` | `Promise<void>` | jedna transakcja; przy błędzie nic nie zostaje zapisane |

Błędy: `StorageError` z kodem `QUOTA_EXCEEDED` lub `UNAVAILABLE` (np. przeglądarka blokuje
IndexedDB w trybie prywatnym) — UI pokazuje komunikat po polsku.

Implementacje: `createIndexedDbRepository()` (P1). Metody US2–US4 (`renameSet`, `deleteSet`,
`updateEntry`, `addEntries`…) zostaną dodane w kolejnych fazach bez zmiany powyższych sygnatur.
Przyszła implementacja synchronizowana z backendem musi spełniać ten sam kontrakt.
