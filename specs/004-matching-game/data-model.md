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

## Dalej

- US2: rekord zestawu (`localStorage`, `{ [setId]: { bestMs, achievedAt } }`).
- US3: aktualizacja `WordProgress` (002) po rundzie; wybór par wg `orderEntriesForSession`.
