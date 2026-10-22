---

description: "Task list for 004-matching-game — scope P1 (User Story 1)"
---

# Tasks: Dopasowywanie na czas — zakres P1

**Input**: Design documents from `/specs/004-matching-game/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Wymagane przez konstytucję (zasada V) dla logiki rundy; UI ręcznie wg quickstart.md.

**Organization**: Zakres: User Story 1 (P1), User Story 2 (P2) i User Story 3 (P3) — wszystkie historyjki specyfikacji.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Create directories lib/matching/, app/matching/, app/components/matching/, tests/unit/matching/

---

## Phase 2: User Story 1 - Runda dopasowywania na czas (Priority: P1) 🎯 MVP

**Goal**: Z panelu zestawu użytkownik uruchamia rundę: start → plansza 6 par → dopasowania z karą 1 s za błąd → wynik.

**Independent Test**: quickstart.md kroki 1–9.

### Tests for User Story 1 ⚠️

- [X] T002 [P] [US1] Write tests in tests/unit/matching/game.test.ts per contracts/matching-game.md: `selectPairs` returns max 6 pairs, all when set has 4–5 entries, never two pairs with same normalized Italian or Polish text (e.g. „prego/proszę” + „per favore/proszę” → only one), deterministic with injected `random`; `createBoard` → 2 tiles per pair (`${entryId}:it` / `:pl`, correct `lang` and `text`); reducer: first select marks tile; same tile deselects; same-language tile moves selection without mistake; counterpart → `matchedEntryIds` grows and selection clears; wrong tile → `mistakes` +1, `errorEntryIds` contains both entries once, `wrongTileIds` set; `clearFeedback` clears `wrongTileIds`; last pair sets `finishedAt`; select on matched tile or after finish returns same object; `elapsedMs` adds 1000 ms per mistake and stops at `finishedAt`; `formatSeconds(12340) === '12,3 s'`, `formatSeconds(0) === '0,0 s'`
- [X] T003 [P] [US1] Update tests/unit/modes/catalog.test.ts: available modes are `flashcards` and `matching`; `modeHref('matching', 'a b') === '/matching?set=a%20b'`; `word-tower` and `grammar-runner` still `null`

### Implementation for User Story 1

- [X] T004 [US1] Implement lib/matching/game.ts (types `MatchingTile`, `MatchingState`, `MatchingAction`; `MATCHING_PAIRS`, `PENALTY_MS`, `MIN_PAIRS`; `selectPairs`, `createBoard`, `createMatchingState`, `matchingReducer`, `elapsedMs`, `formatSeconds`) per data-model.md — makes T002 pass
- [X] T005 [US1] In lib/modes/catalog.ts set `matching` to `status: 'available'` and return `/matching?set=${encodeURIComponent(setId)}` from `modeHref` — makes T003 pass
- [X] T006 [P] [US1] Create app/components/matching/MatchingResult.tsx: „Czas: {formatSeconds}”, „Błędy: N”, list of pairs with mistakes (Italian `lang="it"` + Polish), buttons „Zagraj jeszcze raz” (autoFocus) and „Wróć do zestawu” (link `exitHref`), ≥ 44 px
- [X] T007 [US1] Create app/components/matching/MatchingGame.tsx: props `pairs`, `exitHref`, `onFinished?`; `useReducer(matchingReducer)` started at mount; stopwatch re-render every 100 ms showing `formatSeconds(elapsedMs)` and „Błędy: N” until finished; grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`; tiles = `<button>` with `aria-pressed`, `lang`, min height 44 px, font size by text length, `break-words`; matched tiles stay as `invisible` + `aria-hidden` placeholders; wrong tiles red border + framer-motion shake (skipped with `useReducedMotion()`), `clearFeedback` after 500 ms; `aria-live="polite"` messages „Para!” / „Błąd, plus 1 sekunda”; „Zakończ” → `router.push(exitHref)`; when finished render `MatchingResult` (restart via parent callback)
- [X] T008 [US1] Create route app/matching/page.tsx (client, `useSearchParams().get('set')` in `Suspense`): load set via `useWordSet`; loading / error / not found states (as flashcards page); back link „Zestaw” → `/set?id=`; `markModeUsed('matching')` and `markStudied(setId)` when set loads; start screen with set name, instruction „Znajdź pary: słówko włoskie i jego polski odpowiednik. Każdy błąd to +1 s.”, „Start”; on start compute `selectPairs(entries)` — fewer than `MIN_PAIRS` → message „Za mało różnych słówek w zestawie, aby zagrać.”; „Zagraj jeszcze raz” starts a new round with new pairs
- [X] T009 [P] [US1] Add `/matching` to `PRECACHE_PAGES` and bump `CACHE_VERSION` to `'v4'` in public/sw.js

---

## Phase 3: Polish

- [X] T010 Run quality gates: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`
- [ ] T011 Run quickstart.md manual scenario (360 px, keyboard-only, reduced motion)

---

## Phase 4: User Story 2 - Rekord zestawu (Priority: P2)

**Goal**: Najlepszy czas ukończonej rundy jest zapamiętywany dla każdego zestawu, pokazywany na ekranie startu i w wyniku; pobicie rekordu jest wyróżnione.

**Independent Test**: quickstart.md „Scenariusz US2”.

### Tests for User Story 2 ⚠️

- [X] T012 [P] [US2] Write tests in tests/unit/preferences/matching-records.test.ts per contracts/matching-game.md: `isNewRecord(undefined, 5000)` true, `isNewRecord(5000, 4999)` true, `isNewRecord(5000, 5000)` false; `submitMatchingResult('s1', 20000, now, storage)` on empty storage → `{ isNewRecord: true, previousBestMs: null, bestMs: 20000 }` and saved under key `parleme.matchingRecords` with `achievedAt = now.toISOString()`; slower result → `isNewRecord: false`, stored record unchanged, `bestMs` = old; faster → replaced; records of two sets independent; `clearMatchingRecord('s1')` removes only `s1`; corrupted JSON / entries without numeric `bestMs` / throwing storage / `undefined` storage → no records and no throw

### Implementation for User Story 2

- [X] T013 [US2] Implement lib/preferences/matching-records.ts (`MATCHING_RECORDS_KEY`, `MatchingRecord`, `isNewRecord`, `loadMatchingRecords`, `submitMatchingResult`, `clearMatchingRecord`) per data-model.md „Rekord zestawu” — makes T012 pass
- [X] T014 [US2] Create hooks/use-matching-record.ts: `useMatchingRecord(setId)` → `{ bestMs: number | null, submit(timeMs) → { isNewRecord, previousBestMs, bestMs } }` via `browserStorage()`; `submit` updates `bestMs` state
- [X] T015 [US2] Update app/components/matching/MatchingGame.tsx: prop `onFinished: (timeMs: number) => RecordOutcome`; call it exactly once when the round finishes (not on „Zakończ”), keep the outcome in state and pass it to `MatchingResult`
- [X] T016 [P] [US2] Update app/components/matching/MatchingResult.tsx: prop `record: { isNewRecord, bestMs }`; when `isNewRecord` show highlighted „Nowy rekord!” next to the time; otherwise show „Rekord: {formatSeconds(bestMs)}”
- [X] T017 [US2] Update app/matching/page.tsx: use `useMatchingRecord(setId)`; start screen shows „Rekord: {formatSeconds(bestMs)}” when present; pass `onFinished={submit}` to `MatchingGame`
- [X] T018 [US2] Clear the record on set deletion: call `clearMatchingRecord(id, browserStorage())` in `useWordSetActions().deleteSet` (hooks/use-word-sets.ts) — FR-013

---

## Phase 5: Polish (US2)

- [X] T019 Run quality gates: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`
- [ ] T020 Run quickstart.md „Scenariusz US2” manually

---

## Phase 6: User Story 3 - Wynik wpływa na postęp słówek (Priority: P3)

**Goal**: Po ukończonej rundzie słówka z błędami dostają „Nie znam” (zeruje serię, odbiera opanowanie), bezbłędne — „Znam” bez zmiany serii; pary wybierane wg priorytetu postępu.

**Independent Test**: quickstart.md „Scenariusz US3”.

### Tests for User Story 3 ⚠️

- [X] T021 [US3] Extend tests/unit/matching/game.test.ts: `roundResult` of a finished round with a mistake between A and B → `timeMs` equals `elapsedMs(state, finishedAt)`, ratings `{ entryId: A, rating: 'unknown', firstInSession: true }`, same for B, and `{ rating: 'known', firstInSession: false }` for error-free pairs, one rating per pair; `selectPairs(entries, { progress, random })` puts entries with `lastRating: 'unknown'` first, keeps de-duplication of texts, max 6; without `progress` behaviour unchanged
- [X] T022 [P] [US3] Extend tests/unit/progress/progress.test.ts: applying matching ratings with `applyRating` — `unknown` + `firstInSession: true` on mastered progress → `mastered: false`, streak 0; `known` + `firstInSession: false` on progress with streak 1 → streak stays 1, `mastered` unchanged

### Implementation for User Story 3

- [X] T023 [US3] In lib/matching/game.ts add `progress?: Record<string, WordProgress>` option to `selectPairs` (order with `orderEntriesForSession` before de-duplication, else shuffle) and implement `roundResult(state)` returning `{ timeMs, ratings }` per data-model.md — makes T021 pass (T022 should pass with existing `applyRating`)
- [X] T024 [US3] Update app/components/matching/MatchingGame.tsx: `onFinished` receives `roundResult(state)` (`{ timeMs, ratings }`) instead of a bare time; still called exactly once per finished round
- [X] T025 [US3] Update app/matching/page.tsx: use `useWordProgress(setId)`; keep „Start” disabled until progress is loaded; `selectPairs(data.entries, { progress })`; on finish call `saveRating` for every rating, then `submit(result.timeMs)` for the record; show `storageWarning` as an `Alert`
- [X] T026 [P] [US3] Update specs/004-matching-game/contracts/matching-game.md (`MatchingGame.onFinished` receives `{ timeMs, ratings }`) if signatures differ from the implementation

---

## Phase 7: Polish (US3)

- [X] T027 Run quality gates: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`
- [ ] T028 Run quickstart.md „Scenariusz US3” manually

---

## Dependencies & Execution Order

- T001 → (T002, T003 parallel) → T004 (after T002), T005 (after T003) → T006 parallel with T004/T005 → T007 (after T004, T006) → T008 (after T005, T007); T009 any time; T010 after T001–T009; T011 last.
- US2: T012 → T013 → T014 → (T015, T016 parallel) → T017; T018 after T013; T019 after T012–T018; T020 last.
- US3: T021, T022 parallel → T023 → T024 → T025; T026 any time after T024; T027 after T021–T026; T028 last.

## Implementation Strategy

MVP = Phase 1–2. Następnie US2 (rekord zestawu) i US3 (postęp słówek + wybór par wg priorytetu) przez kolejne `/speckit-tasks`.
