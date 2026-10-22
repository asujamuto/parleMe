# Contract: postęp słówek (`lib/progress/`) — US2

Rdzeń współdzielony przez wszystkie tryby nauki (konstytucja, zasada IV). Typy w
[data-model.md](../data-model.md).

## Czyste funkcje (`lib/progress/progress.ts`)

| Funkcja | Zwraca | Zachowanie |
|---------|--------|------------|
| `applyRating(previous, { entryId, setId, rating, firstInSession, now })` | `WordProgress` | reguły przejść z data-model; `previous` może być `undefined` |
| `orderEntriesForSession(entries, progressByEntryId, random = Math.random)` | `WordEntry[]` | grupy 1–4 z FR-012; `random` wstrzykiwany do testów |
| `countMastered(progress[])` | number | liczba `mastered === true` |

## Repozytorium (`ProgressRepository`, `lib/progress/indexeddb-progress-repository.ts`)

| Metoda | Zwraca | Zachowanie |
|--------|--------|------------|
| `listBySet(setId)` | `Promise<WordProgress[]>` | postęp słówek zestawu |
| `save(progress)` | `Promise<void>` | `put` jednego rekordu (wywoływane przy każdej ocenie) |
| `masteredCountsBySet()` | `Promise<Record<setId, number>>` | do listy zestawów (FR-014) |
| `deleteBySet(setId)` | `Promise<void>` | dla przyszłego usuwania zestawu (FR-015) |

Błędy: `StorageError` z `lib/word-sets/repository.ts`.

## Zmiana w `lib/flashcards/session.ts`

`createSession(setId, entries, { now, progress?, random? })` — gdy podano `progress`
(`Record<entryId, WordProgress>`), kolejność kart z `orderEntriesForSession`; bez niego jak w P1
(wg `position`).
