# Contract: logika sesji fiszek (`lib/flashcards/session.ts`)

Czyste funkcje, bez efektów ubocznych; czas wstrzykiwany parametrem `now` (ms).

| Funkcja | Zwraca | Zachowanie |
|---------|--------|------------|
| `createSession(setId, entries, { now, maxCards = 20, direction = 'it-pl', progress?, random? })` | `FlashcardSession` | bez `progress`: pierwsze `maxCards` wg `position`; z `progress`: kolejność `orderEntriesForSession` (FR-012) |
| `sessionReducer(state, action)` | `FlashcardSession` | akcje: `{ type: 'flip' }`, `{ type: 'rate', rating, now }`, `{ type: 'setDirection', direction }` (US3: przód karty w nowym kierunku, runda bez zmian) |
| `currentCard(state)` | `WordEntry \| null` | `null` po zakończeniu rundy |
| `cardSides(card, direction)` | `{ front, back, frontLang, backLang }` | `it-pl`: przód włoski (`lang="it"`) |
| `getSessionSummary(state)` | `SessionSummary` | tylko dla zakończonej rundy |
| `formatDuration(ms)` | string | `"1:05"`, `"0:42"` |

Gwarancje:

- `rate` przy `flipped === false` i `flip` po zakończeniu zwracają ten sam obiekt stanu.
- Karta oceniona „Nie znam” trafia na koniec kolejki; runda kończy się, gdy kolejka jest pusta.
- `firstRatings` zapisuje tylko pierwszą ocenę karty w rundzie.

Integracja z US2: `createSession` przyjmie opcjonalny postęp słówek do ustalenia kolejności
(FR-012) bez zmiany pozostałych sygnatur.
