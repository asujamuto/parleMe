---

description: "Task list for 003-set-mode-hub (US1–US3, option A: hub only)"
---

# Tasks: Panel zestawu z kafelkami trybów nauki

**Input**: Design documents from `/specs/003-set-mode-hub/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Wymagane przez konstytucję (zasada V) dla katalogu trybów i preferencji; UI ręcznie wg quickstart.md.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational — katalog trybów

- [X] T001 Write tests in tests/unit/modes/catalog.test.ts: `STUDY_MODES` ids in order `flashcards`, `word-tower`, `matching`, `grammar-runner`; only `flashcards` has `status: 'available'`; `minWords` flashcards 1, others 4; `getTileState` → `coming-soon` for coming-soon mode regardless of count, `too-few-words` for available mode with `wordCount < minWords` (use a test mode object), `available` otherwise; `modeHref('flashcards', 'a b')` → `/flashcards?set=a%20b`, other ids → `null`
- [X] T002 Implement lib/modes/catalog.ts per data-model.md (`StudyModeId`, `StudyMode`, `STUDY_MODES`, `getTileState`, `modeHref`) — makes T001 pass

---

## Phase 2: User Story 1 - Panel zestawu z kafelkami trybów (Priority: P1) 🎯 MVP

**Goal**: Wybór zestawu otwiera panel z nagłówkiem, 4 kafelkami (Fiszki dostępne, 3 „Wkrótce”) i dotychczasowym zarządzaniem zestawem; tryb wraca na panel.

**Independent Test**: quickstart.md kroki 1–4, 6–7.

- [X] T003 [P] [US1] Create app/components/modes/ModeTiles.tsx: props `setId`, `wordCount`, `lastModeId?: StudyModeId | null`; grid `grid-cols-2` (gap, cards ≥ 44 px); icons per id from lucide (`Layers`, `Blocks`, `Timer`, `Footprints`); available tile = `Link` to `modeHref` (whole card, focus ring); unavailable tile = `div aria-disabled="true"` with muted style and visible „Wkrótce” or „Wymaga co najmniej N słówek”; „Ostatnio” `Badge` when `lastModeId === mode.id`; section heading „Tryby nauki”
- [X] T004 [US1] Rework app/set/page.tsx into the hub: header (name, `formatWordCount`, „Opanowane: X / N”), `ModeTiles` directly under header, then „Zmień nazwę” / „Usuń” actions and the „Słówka” list; remove the separate „Fiszki” button
- [X] T005 [P] [US1] Update app/components/word-sets/WordSetList.tsx: replace footer „Fiszki” button with „Ucz się” link button to `/set?id={id}` (≥ 44 px, `aria-label="Ucz się: {name}"`)
- [X] T006 [US1] Return from flashcards to the hub: add `exitHref` prop to app/components/flashcards/FlashcardSession.tsx („Zakończ” → `router.push(exitHref)`) and app/components/flashcards/SessionSummary.tsx (button „Wróć do zestawu” → `exitHref`); in app/flashcards/page.tsx pass `exitHref={/set?id=...}` and change the header back link to „Zestaw” → hub when the set is loaded

**Checkpoint**: Panel działa i jest jedynym wejściem do trybów zestawu.

---

## Phase 3: User Story 2 - Wymagania trybu wobec zestawu (Priority: P2)

**Goal**: Kafelek dostępnego trybu jest nieaktywny z komunikatem, gdy zestaw ma za mało słówek.

**Independent Test**: test jednostkowy `getTileState` (T001) + kafelek renderuje stan `too-few-words` (T003).

- [X] T007 [US2] Verify `ModeTiles` uses `getTileState` for every tile (no duplicated threshold logic in UI) and that the `too-few-words` text is „Wymaga co najmniej N słówek” with Polish plural via `formatWordCount`-style wording in app/components/modes/ModeTiles.tsx

---

## Phase 4: User Story 3 - Ostatnio używany tryb (Priority: P3)

**Goal**: Oznaczenie „Ostatnio” na kafelku ostatnio uruchomionego trybu, osobno dla każdego zestawu.

**Independent Test**: quickstart.md krok 5.

- [X] T008 [P] [US3] Write tests in tests/unit/preferences/last-mode.test.ts: key `parleme.lastModeBySet`; `saveLastMode('s1','flashcards')` then `loadLastModes()` → `{ s1: 'flashcards' }`; two sets kept separately; `clearLastMode('s1')` removes only `s1`; invalid JSON / unknown mode id / throwing storage / `undefined` storage → `{}` (or entry skipped) and no throw
- [X] T009 [US3] Implement lib/preferences/last-mode.ts (`LAST_MODE_KEY`, `loadLastModes`, `saveLastMode`, `clearLastMode`) — makes T008 pass
- [X] T010 [US3] Create hooks/use-last-mode.ts (`useLastMode(setId)` → `{ lastModeId, markModeUsed(modeId) }` via `browserStorage()`); call `markModeUsed('flashcards')` when the flashcards page loads its set (app/flashcards/page.tsx); pass `lastModeId` to `ModeTiles` in app/set/page.tsx
- [X] T011 [US3] Clear the set's last mode on delete: in `useWordSetActions().deleteSet` (hooks/use-word-sets.ts) call `clearLastMode(id, browserStorage())`

---

## Phase 5: Polish

- [X] T012 Run quality gates: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`
- [ ] T013 Run quickstart.md manual scenario (360 px, keyboard-only)

---

## Dependencies & Execution Order

- T001 → T002 → T003 → T004; T005 and T006 independent of T003/T004 (different files); T007 after T003.
- T008 → T009 → T010 (after T004, T006); T011 after T009.
- T012 after T001–T011; T013 last.

## Parallel Example

```text
T003 ModeTiles.tsx | T005 WordSetList.tsx | T008 last-mode.test.ts
```

## Implementation Strategy

MVP = Phase 1–2 (panel z działającymi Fiszkami). Następnie US2 (reguła minimum — już w
katalogu) i US3 (oznaczenie „Ostatnio”). Kolejne gry: osobne `/speckit-specify` dla Italian Word
Tower, Dopasowywania na czas i Grammar Runner; każda włącza swój kafelek w `lib/modes/catalog.ts`.
