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

## WordProgress (trwały — US2)

IndexedDB `parleme`, **wersja 2**: nowy magazyn `wordProgress` (keyPath `entryId`, indeks
`setId`). Migracja v1 → v2 tylko dodaje magazyn — istniejące zestawy i słówka zostają.

| Pole | Typ | Reguły |
|------|-----|--------|
| `entryId` | string | → `WordEntry.id` (stały identyfikator z 001) |
| `setId` | string | → `WordSet.id`; usunięcie zestawu usuwa jego postęp (FR-015) |
| `lastRating` | `'known' \| 'unknown'` | ostatnia ocena (także powtórki w rundzie) |
| `lastRatedAt` | string (ISO 8601) | czas ostatniej oceny |
| `knownStreakSessions` | number | kolejne sesje ze „Znam” przy **pierwszym** pokazaniu w sesji |
| `mastered` | boolean | `knownStreakSessions >= 2` (FR-013) |
| `knownTotal` / `unknownTotal` | number | liczniki wszystkich ocen |

Przejścia (`applyRating`, przy każdej ocenie — FR-011):

```text
pierwsza ocena karty w sesji = known   → streak + 1, mastered = streak >= 2
pierwsza ocena karty w sesji = unknown → streak = 0, mastered = false
ocena powtórki w tej samej sesji       → tylko lastRating, lastRatedAt, liczniki
każda ocena                            → lastRating, lastRatedAt, knownTotal/unknownTotal + 1
```

Kolejność kart nowej rundy (`orderEntriesForSession`, FR-012):

```text
1. lastRating = unknown            (losowo)
2. bez postępu (nigdy pokazane)    (wg position)
3. lastRating = known, !mastered   (losowo)
4. mastered                        (losowo)
→ pierwsze 20 kart
```

## StudyPreferences (trwały — US3)

| Pole | Typ | Przechowywanie | Reguły |
|------|-----|----------------|--------|
| `flashcardDirection` | `'it-pl' \| 'pl-it'` | `localStorage`, klucz `parleme.flashcardDirection` | wartość nieznana / brak / błąd odczytu → `'it-pl'`; wspólny dla wszystkich zestawów (FR-016) |

Zmiana kierunku w trakcie rundy (akcja `setDirection`): bieżąca karta wraca na przód w nowym
kierunku (`flipped = false`); kolejka, oceny i liczniki rundy bez zmian. Postęp słówka
(`WordProgress`) jest wspólny dla obu kierunków.
