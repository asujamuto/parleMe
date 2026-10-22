# Contract: `lib/matching/game.ts`

| Funkcja / stała | Zwraca | Zachowanie |
|-----------------|--------|------------|
| `MATCHING_PAIRS = 6`, `PENALTY_MS = 1000`, `MIN_PAIRS = 2` | — | parametry rundy |
| `selectPairs(entries, { random?, maxPairs? })` | `WordEntry[]` | tasuje, wybiera do `maxPairs` par bez powtórzeń tekstu IT/PL (R2) |
| `createBoard(pairs, random?)` | `MatchingTile[]` | 2 kafelki na parę, kolejność losowa |
| `createMatchingState(pairs, { now, random? })` | `MatchingState` | stan początkowy rundy |
| `matchingReducer(state, action)` | `MatchingState` | akcje `{ type: 'select', tileId, now }`, `{ type: 'clearFeedback' }` (data-model) |
| `elapsedMs(state, now)` | number | z karami |
| `formatSeconds(ms)` | string | `12300` → `"12,3 s"` |

Gwarancje: akcje niezmieniające stanu zwracają ten sam obiekt; każdy kafelek ma dokładnie jeden
odpowiednik na planszy.
