# Contract: `lib/matching/game.ts`

| Funkcja / stała | Zwraca | Zachowanie |
|-----------------|--------|------------|
| `MATCHING_PAIRS = 6`, `PENALTY_MS = 1000`, `MIN_PAIRS = 2` | — | parametry rundy |
| `selectPairs(entries, { random?, maxPairs?, progress? })` | `WordEntry[]` | bez `progress` tasuje; z `progress` kolejność `orderEntriesForSession` (US3); wybiera do `maxPairs` par bez powtórzeń tekstu IT/PL (R2) |
| `createBoard(pairs, random?)` | `MatchingTile[]` | 2 kafelki na parę, kolejność losowa |
| `createMatchingState(pairs, { now, random? })` | `MatchingState` | stan początkowy rundy |
| `matchingReducer(state, action)` | `MatchingState` | akcje `{ type: 'select', tileId, now }`, `{ type: 'clearFeedback' }` (data-model) |
| `elapsedMs(state, now)` | number | z karami |
| `formatSeconds(ms)` | string | `12300` → `"12,3 s"` |
| `roundResult(state)` | `{ timeMs, ratings: { entryId, rating, firstInSession }[] }` | US3 — oceny słówek po ukończonej rundzie (data-model) |

Gwarancje: akcje niezmieniające stanu zwracają ten sam obiekt; każdy kafelek ma dokładnie jeden
odpowiednik na planszy.

## Rekord (`lib/preferences/matching-records.ts`) — US2

| Funkcja | Zwraca | Zachowanie |
|---------|--------|------------|
| `isNewRecord(previousBestMs, timeMs)` | boolean | `true`, gdy brak rekordu albo `timeMs < previousBestMs` |
| `loadMatchingRecords(storage?)` | `Record<setId, MatchingRecord>` | odporne na błędy i uszkodzone dane |
| `submitMatchingResult(setId, timeMs, now, storage?)` | `{ isNewRecord, previousBestMs, bestMs }` | zapisuje tylko nowy rekord; nigdy nie rzuca |
| `clearMatchingRecord(setId, storage?)` | void | usuwa wpis zestawu |

## Komponent `MatchingGame` (UI)

`onFinished(result: MatchingRoundResult) => RecordOutcome` — wywoływane dokładnie raz po
ukończeniu rundy (nie przy „Zakończ”); strona zapisuje `result.ratings` przez `saveRating`
(postęp, US3) i `result.timeMs` jako kandydat na rekord (US2).
