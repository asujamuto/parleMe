---

description: "Task list for 002-flashcards-study — scope P1 (User Story 1 + demo removal)"
---

# Tasks: Tryb fiszek na zaimportowanych zestawach — zakres P1

**Input**: Design documents from `/specs/002-flashcards-study/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Wymagane przez konstytucję (zasada V) dla logiki sesji; UI ręcznie wg quickstart.md.

**Organization**: Zakres to User Story 1 (P1) oraz FR-017/FR-018 (usunięcie demo). US2 i US3 —
kolejne iteracje.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Create directories lib/flashcards/, app/components/flashcards/, tests/unit/flashcards/

---

## Phase 2: Foundational

- [X] T002 Add `useWordSet(setId)` to hooks/use-word-sets.ts returning `{ data: { set, entries } | null, loading, error }` via `getRepository().getSet(setId)`; missing set → `data: null` without error

---

## Phase 3: User Story 1 - Sesja fiszek na wybranym zestawie (Priority: P1) 🎯 MVP

**Goal**: Z listy zestawów użytkownik uruchamia fiszki, odwraca karty, ocenia „Znam” / „Nie znam”, karty „Nie znam” wracają w rundzie, na końcu widzi podsumowanie.

**Independent Test**: quickstart.md kroki 1–7 (18 kart, 3 × „Nie znam” → podsumowanie 15 / 3).

### Tests for User Story 1 ⚠️

- [X] T003 [US1] Write tests in tests/unit/flashcards/session.test.ts per contracts/flashcard-session.md: `createSession` takes max 20 entries ordered by `position`, initial `queue` and `flipped: false`; `flip` then `rate('known')` removes card and increments `knownCount`; `rate('unknown')` moves card to end of queue (after all not-yet-shown cards); repeated „Nie znam” keeps returning; `rate` without flip and `flip` after finish return same state object; `firstRatings` keeps only first rating; empty queue sets `finishedAt`; `getSessionSummary` for 18 cards with 3 „Nie znam” → `knownFirstTry: 15`, `repeated` = those 3 entries, `durationMs`; `cardSides` for `it-pl` (front Italian, `frontLang: 'it'`) and `pl-it`; `formatDuration(65000) === '1:05'`, `formatDuration(42000) === '0:42'`

### Implementation for User Story 1

- [X] T004 [US1] Implement lib/flashcards/session.ts (types `FlashcardSession`, `Rating`, `Direction`, `SessionAction`, `SessionSummary`; functions `createSession`, `sessionReducer`, `currentCard`, `cardSides`, `getSessionSummary`, `formatDuration`) per data-model.md — makes T003 pass
- [X] T005 [P] [US1] Create app/components/flashcards/FlipCard.tsx: single `<button>` showing only current side, framer-motion flip (rotateY -90° → 0°, 250 ms) disabled when `useReducedMotion()`, font size by length (≤ 30 chars `text-3xl`, ≤ 80 `text-2xl`, else `text-xl`), `lang` on text, `break-words`, min height instead of fixed height, hint „Dotknij, aby odwrócić” on front, forwarded ref for focus
- [X] T006 [P] [US1] Create app/components/flashcards/SessionSummary.tsx: „Znane od razu: X”, „Powtórzone: Y”, „Czas: m:ss”, list of repeated words (Italian with `lang="it"` + Polish), buttons „Jeszcze raz” and „Wróć do zestawów” (≥ 44 px)
- [X] T007 [US1] Create app/components/flashcards/FlashcardSession.tsx: `useReducer(sessionReducer)`; header with set name, „Znane: X / N” + Progress, „Runda: 20 z N słówek” when set is larger, „Zakończ” → `/`; buttons „Nie znam” / „Znam” visible only after flip; window `keydown`: Space/Enter flip (skip when target is button/link/input), ArrowRight/`1` known, ArrowLeft/`2` unknown; focus returns to card after rating; `aria-live="polite"` announces back side; finished → `SessionSummary`, „Jeszcze raz” → new `createSession`
- [X] T008 [US1] Create route app/flashcards/page.tsx (client): `useSearchParams().get('set')` w `Suspense`, `useWordSet`; loading skeleton; not found → „Nie znaleziono zestawu” + link to `/`; storage error message; else `FlashcardSession`
- [X] T009 [US1] Add „Fiszki” link button (≥ 44 px, `href="/flashcards?set={id}"`) to each set card in app/components/word-sets/WordSetList.tsx

---

## Phase 4: Usunięcie demo lekcji (FR-017, FR-018)

- [X] T010 Delete demo code: app/[slug]/ (page.tsx, study.tsx, study-menu.tsx), app/components/study-session.tsx, app/components/ui/flashcard.tsx, app/data/initial-cards.ts, app/data/lessons.ts, app/types/flashcard.ts, app/types/lesson.ts
- [X] T011 Add `async redirects()` to next.config.js: `{ source: '/:lesson(\\d+)', destination: '/', permanent: false }`

---

## Phase 5: Polish

- [X] T012 Run quality gates: `npm run lint`, `npm test`, `npm run build`; verify no remaining imports of deleted modules
- [ ] T013 Run quickstart.md manual scenario (360 px, keyboard-only, reduced motion)

---

## Phase 6: Foundational for US2 — wspólna baza IndexedDB v2

**Purpose**: Jedno miejsce otwierania bazy `parleme` dla zestawów i postępu; migracja v1 → v2 bez utraty danych.

- [X] T014 Extract DB opening from lib/word-sets/indexeddb-repository.ts into lib/storage/db.ts: export `ParleMeDB` schema (stores `wordSets` keyPath `id` + index `createdAt`, `wordEntries` keyPath `id` + index `setId`, new `wordProgress` keyPath `entryId` + index `setId`), `DB_VERSION = 2`, `openParleMeDb(dbName)` with `upgrade(db, oldVersion)` creating v1 stores only when `oldVersion < 1` and `wordProgress` when `oldVersion < 2`; open failure → `StorageError('UNAVAILABLE')`. Refactor `createIndexedDbRepository` to use it (no behaviour change; existing tests in tests/unit/word-sets/indexeddb-repository.test.ts must still pass)
- [X] T015 Add migration test in tests/unit/storage/db.test.ts using `fake-indexeddb/auto`: create DB at version 1 with raw `idb.openDB` (v1 stores + one set and entry), then `openParleMeDb` → set and entry still readable, `wordProgress` store exists

**Checkpoint**: Istniejące zestawy użytkowników przetrwają aktualizację aplikacji.

---

## Phase 7: User Story 2 - Postęp słówek i powtarzanie trudnych (Priority: P2)

**Goal**: Każda ocena zapisuje się od razu; nowa sesja zaczyna się od słówek ostatnio „Nie znam”; lista zestawów pokazuje „Opanowane: X / N”.

**Independent Test**: quickstart.md sekcja US2 — sesja z 3 × „Nie znam”, przeładowanie (także offline), nowa sesja zaczyna się od tych 3 kart, lista pokazuje „Opanowane: 0 / 18”, po dwóch sesjach ze „Znam” — „Opanowane: 18 / 18”.

### Tests for User Story 2 ⚠️

- [X] T016 [P] [US2] Write tests in tests/unit/progress/progress.test.ts per contracts/word-progress.md: `applyRating` — new progress from `undefined`; first-in-session „known” increments `knownStreakSessions`, `mastered` becomes true at streak 2; first-in-session „unknown” resets streak to 0 and `mastered` to false; repeat rating (`firstInSession: false`) changes only `lastRating`, `lastRatedAt`, totals; totals increment per rating. `orderEntriesForSession` with deterministic `random` — order groups: lastRating unknown → no progress (by `position`) → known not mastered → mastered. `countMastered`
- [X] T017 [P] [US2] Write tests in tests/unit/progress/indexeddb-progress-repository.test.ts with `fake-indexeddb/auto`: `save` + `listBySet` round-trip and overwrite by `entryId`; `listBySet` returns only given set; `masteredCountsBySet` → `{ s1: 2, s2: 0 }`-style map (sets without mastered words may be absent or 0); `deleteBySet` removes only that set's progress
- [X] T018 [US2] Extend tests/unit/flashcards/session.test.ts: `createSession` with `progress` + deterministic `random` puts last-„unknown” entries first and mastered last; still max 20 cards; without `progress` unchanged (by `position`)

### Implementation for User Story 2

- [X] T019 [US2] Implement lib/progress/types.ts (`WordProgress`: `entryId`, `setId`, `lastRating: 'known' | 'unknown'`, `lastRatedAt` ISO 8601, `knownStreakSessions`, `mastered`, `knownTotal`, `unknownTotal`; `MASTERED_STREAK = 2`) and lib/progress/progress.ts (`applyRating`, `orderEntriesForSession`, `countMastered`) — makes T016 pass
- [X] T020 [US2] Implement `createIndexedDbProgressRepository(dbName = 'parleme')` in lib/progress/indexeddb-progress-repository.ts using `openParleMeDb` (`listBySet` via index `setId`, `save` via `put`, `masteredCountsBySet` iterating store, `deleteBySet` in one readwrite transaction); export `ProgressRepository` interface — makes T017 pass
- [X] T021 [US2] Extend `createSession` in lib/flashcards/session.ts with optional `progress?: Record<string, WordProgress>` and `random?: () => number` options using `orderEntriesForSession` before slicing to `maxCards` — makes T018 pass; update contracts/flashcard-session.md signature
- [X] T022 [US2] Create hooks/use-word-progress.ts: `useWordProgress(setId)` → `{ progress: Record<entryId, WordProgress>, loading, saveRating({ entryId, rating, firstInSession }), storageWarning }`; `saveRating` computes `applyRating`, updates local state immediately and persists via repository; on `StorageError` sets `storageWarning` (message „Postęp nie zostanie zapamiętany na tym urządzeniu.”) once and keeps the session working; `useMasteredCounts()` → `Record<setId, number>` for the list
- [X] T023 [US2] Wire progress into app/flashcards/page.tsx and app/components/flashcards/FlashcardSession.tsx: wait for progress before first `createSession` (pass `progress`); on each rating call `saveRating` with `firstInSession = !(cardId in session.firstRatings)` evaluated before dispatch; „Jeszcze raz” creates the next session from the updated in-memory progress; show `storageWarning` as a single `Alert` above the card
- [X] T024 [US2] Show „Opanowane: X / N” per set in app/components/word-sets/WordSetList.tsx (new prop `masteredCounts: Record<string, number>`, default 0) and pass `useMasteredCounts()` from app/page.tsx
- [X] T025 [US2] Add US2 manual scenario to specs/002-flashcards-study/quickstart.md (3 × „Nie znam” → reload → those cards first; „Opanowane” after two all-„Znam” sessions; offline reload keeps ratings)

---

## Phase 8: Polish (US2)

- [X] T026 Run quality gates: `npm run lint`, `npm test`, `npm run build`
- [ ] T027 Run quickstart.md US2 manual scenario

---

## Phase 9: User Story 3 - Kierunek nauki polski → włoski (Priority: P3)

**Goal**: Użytkownik przełącza kierunek fiszek (IT → PL / PL → IT) przed lub w trakcie sesji; wybór jest zapamiętany i wspólny dla wszystkich zestawów (FR-016).

**Independent Test**: quickstart.md sekcja US3 — przełączenie na „PL → IT” pokazuje z przodu tekst polski, po odwróceniu włoski; po przeładowaniu i otwarciu innego zestawu kierunek zostaje „PL → IT”.

### Tests for User Story 3 ⚠️

- [X] T028 [P] [US3] Write tests in tests/unit/preferences/flashcard-direction.test.ts: `parseDirection('pl-it') === 'pl-it'`, `parseDirection(null)`, `parseDirection('xx')` → `'it-pl'`; `saveDirection` then `loadDirection` round-trip with an in-memory `Storage` stub using key `parleme.flashcardDirection`; `loadDirection` and `saveDirection` with a stub whose `getItem`/`setItem` throw → return `'it-pl'` / do not throw; `loadDirection(undefined)` → `'it-pl'`
- [X] T029 [P] [US3] Extend tests/unit/flashcards/session.test.ts: `createSession(..., { direction: 'pl-it' })` sets direction; action `{ type: 'setDirection', direction: 'pl-it' }` changes `direction`, sets `flipped` to `false`, keeps `queue`, `firstRatings`, `knownCount`; same direction or finished session → returns the same state object

### Implementation for User Story 3

- [X] T030 [P] [US3] Implement lib/preferences/flashcard-direction.ts: `DIRECTION_STORAGE_KEY = 'parleme.flashcardDirection'`, `parseDirection(raw: string | null): Direction` (anything other than `'it-pl' | 'pl-it'` → `'it-pl'`), `loadDirection(storage?: Pick<Storage, 'getItem'>)`, `saveDirection(direction, storage?: Pick<Storage, 'setItem'>)` — both wrapped in try/catch, never throw (makes T028 pass)
- [X] T031 [US3] Add `{ type: 'setDirection'; direction: Direction }` to `SessionAction` and handle it in `sessionReducer` in lib/flashcards/session.ts per data-model.md (makes T029 pass); add the action to specs/002-flashcards-study/contracts/flashcard-session.md
- [X] T032 [US3] Create hooks/use-flashcard-direction.ts: `useFlashcardDirection()` → `{ direction, ready, setDirection }`; reads `loadDirection(window.localStorage)` in `useEffect` (guard access in try/catch), sets `ready` after reading; `setDirection` updates state and calls `saveDirection`
- [X] T033 [US3] Update app/components/flashcards/FlashcardSession.tsx: props `initialDirection: Direction` and `onDirectionChange(direction)`; pass `direction` to `createSession` (initial and „Jeszcze raz” uses current `session.direction`); add `ToggleGroup type="single"` (components/ui/toggle-group.tsx) with items „IT → PL” (`it-pl`) and „PL → IT” (`pl-it`), `aria-label="Kierunek fiszek"`, items ≥ 44 px, inside a wrapper with `data-no-card-shortcuts`; on change dispatch `setDirection` and call `onDirectionChange`; window `keydown` handler returns early when `event.target` is inside `[data-no-card-shortcuts]`
- [X] T034 [US3] Update app/flashcards/page.tsx: use `useFlashcardDirection()`, show `LoadingState` until `ready`, pass `initialDirection={direction}` and `onDirectionChange={setDirection}` to `FlashcardSession`
- [X] T035 [P] [US3] Add US3 manual scenario to specs/002-flashcards-study/quickstart.md (toggle before and during a round, reload, other set keeps direction, arrow keys on the toggle do not rate the card)

---

## Phase 10: Polish (US3)

- [X] T036 Run quality gates: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`
- [ ] T037 Run quickstart.md US3 manual scenario

---

## Dependencies & Execution Order

- P1: T001 → T002 → T003 → T004 → (T005, T006 parallel) → T007 → T008; T009 after T001. T010–T011 after T009. T012 after all; T013 last.
- P2: T014 → T015; T016, T017 parallel after T014; T018 after T016. T019 after T016; T020 after T017 + T019; T021 after T018 + T019; T022 after T020; T023 after T021 + T022; T024 after T022; T025 any time; T026 after T014–T025; T027 last.
- P3 (independent of P2 tasks except shared files): T028, T029 parallel; T030 after T028 (parallel with T031); T031 after T029; T032 after T030; T033 after T031 + T032; T034 after T032 + T033; T035 any time; T036 after T028–T035; T037 last.

## Parallel Example: User Story 2

```text
T016 progress.test.ts | T017 indexeddb-progress-repository.test.ts
T023 FlashcardSession wiring | T024 WordSetList mastered counts   (both after T022)
```

## Parallel Example: User Story 3

```text
T028 flashcard-direction.test.ts | T029 session.test.ts (setDirection)
T030 lib/preferences/flashcard-direction.ts | T031 lib/flashcards/session.ts | T035 quickstart.md
```

## Implementation Strategy

MVP = Phase 1–4 (P1, gotowe). Przyrost P2 = Phase 6–8: najpierw baza v2 z testem migracji (bez
ryzyka utraty zestawów), potem czysta logika postępu z testami, repozytorium, na końcu UI.
Przyrost P3 = Phase 9–10: najpierw czyste funkcje preferencji i akcja reducera z testami, potem
hook i przełącznik w UI. Po P3 wszystkie historyjki specyfikacji 002 są pokryte zadaniami.
