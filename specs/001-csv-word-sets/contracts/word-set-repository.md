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
| `buildWordSet({ name, pairs, fileName, now, newId, source? })` | dane z podglądu | `{ set: WordSet, entries: WordEntry[] }` | `now` i `newId` wstrzykiwane; `source` domyślnie `'csv'` |

## Repozytorium (`WordSetRepository`)

| Metoda | Zwraca | Zachowanie |
|--------|--------|------------|
| `listSets()` | `Promise<WordSet[]>` | posortowane po `createdAt` malejąco |
| `getSet(id)` | `Promise<{ set, entries } \| null>` | słówka posortowane po `position` |
| `createSet(set, entries)` | `Promise<void>` | jedna transakcja; przy błędzie nic nie zostaje zapisane |
| `renameSet(id, name, now)` | `Promise<WordSet \| null>` | `name` po `trim`, `updatedAt = now`; `null`, gdy zestaw nie istnieje (US2) |
| `deleteSet(id)` | `Promise<void>` | jedna transakcja: zestaw + jego słówka + postęp (US2, R12) |

Błędy: `StorageError` z kodem `QUOTA_EXCEEDED` lub `UNAVAILABLE` (np. przeglądarka blokuje
IndexedDB w trybie prywatnym) — UI pokazuje komunikat po polsku.

Implementacje: `createIndexedDbRepository()`. Metody US3–US4 (`updateEntry`, `addEntries`…) zostaną dodane w kolejnych fazach bez zmiany powyższych sygnatur.
Przyszła implementacja synchronizowana z backendem musi spełniać ten sam kontrakt.

## Preferencja ostatnio uczonego zestawu (`lib/preferences/last-studied-set.ts`)

| Funkcja | Zachowanie |
|---------|------------|
| `loadLastStudiedSetId(storage?)` | `string \| null`; błąd odczytu → `null` |
| `saveLastStudiedSetId(id, storage?)` | nigdy nie rzuca |
| `clearLastStudiedSetId(id, storage?)` | usuwa wpis tylko, jeśli wskazuje `id` |

## Zestaw przykładowy i wzór (`lib/word-sets/sample.ts`) — US5

| Stała / funkcja | Zachowanie |
|-----------------|------------|
| `SAMPLE_SET_NAME` | „Przykład: ITA5” |
| `SAMPLE_CSV` | połączona treść 4 plików ITA5 (nagłówek raz) |
| `TEMPLATE_CSV`, `TEMPLATE_FILE_NAME` | wzór z contracts/csv-format.md, `parleme-wzor.csv` |
| `buildSampleSet({ now, newId })` | `parseWordsCsv(SAMPLE_CSV)` → `buildWordSet({ source: 'sample', fileName: null })` |
