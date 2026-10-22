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

## Dependencies & Execution Order

- T001 → T002 → T003 → T004 → (T005, T006 parallel) → T007 → T008; T009 after T001.
- T010–T011 independent of US1 code, run after T009 (WordSetList no longer needs demo).
- T012 after all; T013 last.

## Implementation Strategy

MVP = Phase 1–4. Następnie US2 (zapis postępu w IndexedDB, kolejność wg FR-012, „Opanowane:
X / N” na liście) i US3 (kierunek PL → IT) przez kolejne `/speckit-tasks`.
