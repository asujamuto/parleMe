# Data Model: Dopasowywanie na czas

## MatchingTile

| Pole | Typ | Opis |
|------|-----|------|
| `id` | string | `${entryId}:it` albo `${entryId}:pl` |
| `entryId` | string | → `WordEntry.id` |
| `lang` | `'it' \| 'pl'` | strona pary |
| `text` | string | `italian` albo `polish` słówka |

## MatchingState (nietrwały — P1)

| Pole | Typ | Opis |
|------|-----|------|
| `pairs` | `WordEntry[]` | pary rundy (2–6) |
| `tiles` | `MatchingTile[]` | kolejność na planszy (stała przez rundę) |
| `selectedTileId` | string \| null | zaznaczony kafelek |
| `matchedEntryIds` | string[] | dopasowane pary |
| `mistakes` | number | liczba błędnych prób |
| `errorEntryIds` | string[] | słówka biorące udział w błędnych próbach (bez powtórzeń) |
| `wrongTileIds` | `[string, string] \| null` | ostatnia błędna próba (do sygnalizacji) |
| `startedAt` | number (ms) | moment „Start” |
| `finishedAt` | number \| null | moment dopasowania ostatniej pary |

Przejścia `select(tileId, now)`:

```text
runda zakończona albo kafelek dopasowany    → bez zmian (ten sam obiekt)
brak zaznaczenia                             → zaznacz kafelek, wyczyść wrongTileIds
kliknięty = zaznaczony                       → odznacz
ten sam język co zaznaczony                  → przenieś zaznaczenie (bez kary)
ten sam entryId (odpowiednik)                → dopasuj parę, odznacz; ostatnia para → finishedAt = now
inny entryId                                 → mistakes + 1, errorEntryIds ∪ oba, wrongTileIds = oba, odznacz
clearFeedback                                → wrongTileIds = null
```

`elapsedMs(state, now) = (finishedAt ?? now) − startedAt + mistakes × 1000`.

## Rekord zestawu (US2)

`localStorage`, klucz `parleme.matchingRecords` → JSON `{ [setId]: { bestMs: number, achievedAt: ISO 8601 } }`.

```text
runda ukończona, brak rekordu        → zapisz, isNewRecord = true
runda ukończona, timeMs < bestMs     → zapisz, isNewRecord = true (previousBestMs = stary)
runda ukończona, timeMs >= bestMs    → bez zmian, isNewRecord = false
„Zakończ” w trakcie rundy            → nic nie jest zapisywane
usunięcie zestawu                    → wpis zestawu usunięty
```

Uszkodzony JSON / niepoprawne wpisy / brak dostępu do pamięci → brak rekordu, bez błędów.

## Wynik rundy a postęp słówek (US3)

`roundResult(state)` (tylko dla ukończonej rundy) → `{ timeMs, ratings }`, gdzie dla każdej pary:

| Para | `rating` | `firstInSession` | Skutek w `applyRating` (002) |
|------|----------|------------------|------------------------------|
| w `errorEntryIds` | `unknown` | `true` | seria = 0, `mastered = false` |
| bez błędu | `known` | `false` | tylko `lastRating`, `lastRatedAt`, liczniki — seria bez zmian |

Wybór par (`selectPairs` z `progress`): `orderEntriesForSession(entries, progress, random)` →
filtr powtórzeń tekstu (R2) → pierwsze 6. Bez `progress` — losowo jak w P1.
