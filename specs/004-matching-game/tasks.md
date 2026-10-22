---

description: "Task list for 004-matching-game — scope P1 (User Story 1)"
---

# Tasks: Dopasowywanie na czas — zakres P1

**Input**: Design documents from `/specs/004-matching-game/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Wymagane przez konstytucję (zasada V) dla logiki rundy; UI ręcznie wg quickstart.md.

**Organization**: Zakres to User Story 1 (P1). US2 (rekord) i US3 (postęp) — kolejne `/speckit-tasks`.

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

## Dependencies & Execution Order

- T001 → (T002, T003 parallel) → T004 (after T002), T005 (after T003) → T006 parallel with T004/T005 → T007 (after T004, T006) → T008 (after T005, T007); T009 any time; T010 after T001–T009; T011 last.

## Implementation Strategy

MVP = Phase 1–2. Następnie US2 (rekord zestawu) i US3 (postęp słówek + wybór par wg priorytetu) przez kolejne `/speckit-tasks`.
