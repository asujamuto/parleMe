# Data Model: Tryb fiszek

## FlashcardSession (nietrwały, stan reducera — P1)

| Pole | Typ | Opis |
|------|-----|------|
| `setId` | string | → `WordSet.id` (funkcja 001) |
| `direction` | `'it-pl' \| 'pl-it'` | P1: zawsze `'it-pl'`; przełączanie w US3 |
| `cards` | `WordEntry[]` | karty rundy (maks. 20), kolejność startowa |
| `queue` | string[] | id kart do pokazania; `queue[0]` = bieżąca karta |
| `flipped` | boolean | czy bieżąca karta jest odwrócona |
| `firstRatings` | `Record<id, 'known' \| 'unknown'>` | pierwsza ocena każdej karty w rundzie |
| `knownCount` | number | karty ocenione „Znam” (usunięte z kolejki) |
| `startedAt` | number (ms) | początek rundy |
| `finishedAt` | number \| null | ustawiane, gdy kolejka jest pusta |

Przejścia:

```text
flip:            flipped=false → true                       (ignorowane, gdy flipped lub koniec)
rate('known'):   flipped=true → usuń queue[0], knownCount++, flipped=false
rate('unknown'): flipped=true → przenieś queue[0] na koniec, flipped=false
                 (rate ignorowane, gdy flipped=false — brak podwójnych ocen)
queue pusta  →   finishedAt = now
restart:         nowa sesja z tych samych słówek zestawu
```

## SessionSummary (wyliczane)

| Pole | Opis |
|------|------|
| `knownFirstTry` | liczba kart z pierwszą oceną „Znam” |
| `repeated` | karty z pierwszą oceną „Nie znam” (lista `WordEntry`) |
| `durationMs` | `finishedAt - startedAt` |

## Dalej (US2, US3)

- `WordProgress` (trwały, IndexedDB `wordProgress`, klucz `entryId`, indeks `setId`):
  `lastRating`, `lastRatedAt`, `knownStreakSessions`, `mastered`, `knownTotal`, `unknownTotal`.
- `StudyPreferences` (trwały): `flashcardDirection`.
