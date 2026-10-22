---

description: "Task list for 001-csv-word-sets — scope P1 (User Story 1)"
---

# Tasks: Import CSV i zarządzanie zestawami słówek — zakres P1

**Input**: Design documents from `/specs/001-csv-word-sets/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Wymagane przez konstytucję (zasada V) dla czystej logiki i repozytorium; UI ręcznie
wg quickstart.md.

**Organization**: Zakres tej listy to User Story 1 (P1). US2–US5 zostaną dodane w kolejnych
iteracjach (`/speckit-tasks`) na tym samym rdzeniu `lib/word-sets/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Narzędzia, zależności i naprawa buildu (research R7, R8)

- [X] T001 Update package.json: add dependency `idb@^8`; add devDependencies `vitest`, `fake-indexeddb`; bump `eslint-config-next` to `15.5.4` and `eslint` to `^8.57`; remove `csv-parser`, `zod-csv`, `aws-amplify`; add script `"test": "vitest run"`; then run `npm install`
- [X] T002 [P] Create vitest.config.ts at repo root (environment `node`, include `tests/**/*.test.ts`, alias `@` → repo root)
- [X] T003 [P] Create .eslintrc.json at repo root extending `next/core-web-vitals`
- [X] T004 [P] Remove obsolete `swcMinify` option from next.config.js
- [X] T005 Remove Amplify from app/layout.tsx (imports of `aws-amplify` and `amplify_outputs.json`, `Amplify.configure`), set `<html lang="pl">`
- [X] T006 Remove Amplify client (`generateClient`, `Schema` import, `client.models.Words.list` effect, `words` state) from app/[slug]/page.tsx, keeping the existing demo flashcard flow working
- [X] T007 Delete legacy import code: app/data/csvParser.ts, utils/fileUploadHandler.ts, app/components/custom/CsvTableUploader.tsx, app/components/custom/ProfileForm.tsx, app/components/custom/providers/Provider.tsx

**Checkpoint**: `npm run lint`, `npm test` (0 tests OK) i `npm run build` uruchamiają się bez błędów konfiguracji (strona główna może jeszcze korzystać ze starego demo).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Typy i schemat rdzenia, z których korzysta parser, repozytorium i UI

- [X] T008 Create domain types in lib/word-sets/types.ts per data-model.md: `WordSet` (`id`, `name` "po trim 1–60 znaków", `source: 'csv' | 'sample' | 'manual'`, `sourceFileName: string | null`, `entryCount`, `createdAt`/`updatedAt` ISO 8601), `WordEntry` (`id`, `setId`, `italian`, `polish`, `position` "od 0"), `ImportReport` (`status: 'ok' | 'blocked'`, `blockingError`, `pairs: {italian, polish, line}[]`, `skipped: {line, reason}[]`, `duplicates: {line, firstLine}[]`, `totalRows`), `ImportBlockingError` with codes `FILE_TOO_LARGE | EMPTY_FILE | MISSING_COLUMNS | TOO_MANY_ROWS | NO_VALID_ROWS | UNREADABLE`, constants `MAX_FILE_BYTES = 1_048_576`, `MAX_ROWS = 2000`, `MAX_SET_NAME_LENGTH = 60`
- [X] T009 [P] Rewrite utils/csvParserSchema.ts: export Zod `wordRowSchema` (`italian`, `polish`: string, trimmed, min length 1 with Polish messages „brak tekstu w kolumnie italian/polish”); remove `formSchema` (lesson form no longer used)
- [X] T010 Define `WordSetRepository` interface and `StorageError` (codes `QUOTA_EXCEEDED`, `UNAVAILABLE`) in lib/word-sets/repository.ts per contracts/word-set-repository.md (`listSets`, `getSet`, `createSet`)

**Checkpoint**: Rdzeń typów gotowy — można pisać testy i implementację US1.

---

## Phase 3: User Story 1 - Import zestawu słówek z pliku CSV (Priority: P1) 🎯 MVP

**Goal**: Użytkownik wybiera plik CSV, widzi podgląd (pary, pominięte wiersze z numerem i przyczyną, powtórzenia), nadaje nazwę i zapisuje zestaw, który pojawia się na liście i przetrwa ponowne otwarcie aplikacji offline.

**Independent Test**: Zaimportować `app/data/2ita1/ITA5(Zwierzęta i porównania (idiomy)).csv`, zamknąć i ponownie otworzyć aplikację (build produkcyjny, offline) — zestaw „18 słówek” widoczny na liście (quickstart.md kroki 1–9).

### Tests for User Story 1 ⚠️

> Napisać najpierw; muszą nie przechodzić przed implementacją.

- [X] T011 [P] [US1] Create test fixtures in tests/fixtures/: `with-errors.csv` (separator `;`, empty `polish` in line 3, fully empty line 4, duplicate of line 2 in line 5 differing only by case/spaces, quoted value with comma, extra column `notes`), `missing-polish.csv` (header `italian,notes`), `header-only.csv`, `all-invalid.csv`
- [X] T012 [P] [US1] Write parser tests in tests/unit/word-sets/parse-csv.test.ts: 4 ITA5 files from app/data/2ita1/ give 21/15/3/18 pairs, 0 skipped, text identical to source after trim (SC-002); BOM + CRLF + header ` polish` handled; `with-errors.csv` reports exact line numbers and Polish reasons, duplicate `{line: 5, firstLine: 2}`, trailing empty lines ignored; blocking codes `MISSING_COLUMNS` (message lists missing column), `EMPTY_FILE`, `NO_VALID_ROWS`, `FILE_TOO_LARGE` (fileSize > 1 048 576), `TOO_MANY_ROWS` (2001 generated rows); 2000 generated rows parse in < 2000 ms (SC-003)
- [X] T013 [P] [US1] Write set-name tests in tests/unit/word-sets/set-name.test.ts: `defaultSetName('ITA5(Zwierzęta).csv') === 'ITA5(Zwierzęta)'`, truncation to 60 chars; `validateSetName` rejects empty/whitespace and > 60 chars with Polish messages; `suggestUniqueName('A', ['A', 'A (2)']) === 'A (3)'`, case-insensitive collision
- [X] T014 [P] [US1] Write tests in tests/unit/word-sets/build-word-set.test.ts: injected `now`/`newId` produce `source: 'csv'`, `entryCount` = pairs length, `createdAt === updatedAt`, entries with `setId`, sequential `position` from 0, unique ids, trimmed name
- [X] T015 [P] [US1] Write repository tests in tests/unit/word-sets/indexeddb-repository.test.ts using `fake-indexeddb/auto`: `createSet` then `getSet` returns entries ordered by `position`; `listSets` sorted by `createdAt` desc; failing transaction (e.g. duplicate entry id) leaves no set and no entries; data persists across a new repository instance on the same DB

### Implementation for User Story 1

- [X] T016 [US1] Implement `parseWordsCsv(text, { fileSize })` in lib/word-sets/parse-csv.ts per research R3–R5 and contracts/csv-format.md: size check before parsing; PapaParse `header: true`, `transformHeader` (strip `﻿`, trim, lowercase), `delimitersToGuess: [',', ';']`, `skipEmptyLines: false`; line = record index + 2; drop trailing empty records; validate each row with `wordRowSchema`; fully empty middle rows → reason „pusty wiersz”; dedupe key = trim + collapse whitespace + `toLocaleLowerCase('pl')`; keep original text (trim only); makes T012 pass
- [X] T017 [P] [US1] Implement `defaultSetName`, `validateSetName`, `suggestUniqueName` in lib/word-sets/set-name.ts (makes T013 pass)
- [X] T018 [P] [US1] Implement `buildWordSet({ name, pairs, fileName, now, newId })` in lib/word-sets/build-word-set.ts (makes T014 pass)
- [X] T019 [US1] Implement `createIndexedDbRepository(dbName = 'parleme')` in lib/word-sets/indexeddb-repository.ts with `idb`: DB version 1, stores `wordSets` (keyPath `id`, index `createdAt`) and `wordEntries` (keyPath `id`, index `setId`); `createSet` in one readwrite transaction over both stores; map `QuotaExceededError` → `StorageError('QUOTA_EXCEEDED')`, open failures → `StorageError('UNAVAILABLE')` (makes T015 pass)
- [X] T020 [US1] Create hook hooks/use-word-sets.ts: lazily creates the repository on the client, exposes `{ sets, loading, error, createFromImport(name, report, fileName) }`, reloads list after save
- [X] T021 [P] [US1] Create app/components/word-sets/CsvFilePicker.tsx: accessible file input (`accept=".csv,text/csv"`), button ≥ 44 px, reads `file.text()` and `file.size`, calls `onFile({ text, size, name })`; shows „Nie udało się odczytać pliku” on read error
- [X] T022 [P] [US1] Create app/components/word-sets/ImportPreview.tsx: summary counts (pary / pominięte / powtórzenia), list of pairs (first 100 + „Pokaż wszystkie (N)”, Italian text with `lang="it"`), list of skipped rows „Wiersz N: przyczyna” and duplicates „Wiersz N: powtórzenie wiersza M”; blocked state shows message plus example from contracts/csv-format.md; mobile layout without horizontal scroll at 360 px
- [X] T023 [P] [US1] Create app/components/word-sets/SetNameField.tsx: labeled input (max 60), inline Polish validation from `validateSetName`, warning when name exists with button to use `suggestUniqueName` proposal
- [X] T024 [US1] Create app/components/word-sets/ImportWizard.tsx: state machine from data-model.md (wybór pliku → analiza → podgląd + nazwa → zapis); „Zapisz” disabled when blocked/invalid name; „Anuluj” returns to `/` without saving; on `StorageError` shows Polish message and keeps preview; on success toast „Zapisano zestaw „{name}”” and navigate to `/`
- [X] T025 [US1] Create route app/import/page.tsx rendering `ImportWizard` with heading „Importuj zestaw z CSV” and back link to `/`
- [X] T026 [P] [US1] Create app/components/word-sets/WordSetList.tsx (cards: name, „{n} słówek” with Polish plural forms słówko/słówka/słówek, date in `pl-PL`, newest first) and app/components/word-sets/EmptyState.tsx (explanation + link button „Importuj CSV” to `/import`)
- [X] T027 [US1] Rewrite app/page.tsx: header „parleMe”, button „Importuj CSV”, `WordSetList` from `useWordSets` or `EmptyState` when no sets, loading and storage-error states; remove old lessons tabs, `initialCards` stats and Amplify imports
- [X] T028 [US1] Add `<Toaster />` (components/ui/toaster.tsx) to app/layout.tsx so import success/error toasts render

**Checkpoint**: US1 działa samodzielnie — import, podgląd, zapis, lista, odporność na błędy (quickstart.md kroki 1–7).

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T029 [P] Create service worker public/sw.js per research R10 (cache name with version constant; navigations network-first with cached fallback; `/_next/static/*` cache-first; cleanup of old caches on `activate`)
- [X] T030 Create app/components/ServiceWorkerRegister.tsx (client component registering `/sw.js` only when `process.env.NODE_ENV === 'production'`) and render it in app/layout.tsx
- [X] T031 Run quality gates: `npm run lint`, `npm test`, `npm run build` — fix any failures
- [ ] T032 Run quickstart.md manual scenario (360 px, keyboard-only, offline after production build) and record results in specs/001-csv-word-sets/quickstart.md

---

## Dependencies & Execution Order

- **Setup (T001–T007)**: T001 first (installs deps); T002–T004 parallel; T005–T007 after T001.
- **Foundational (T008–T010)**: after Setup; T009 parallel with T008; T010 after T008.
- **US1 tests (T011–T015)**: after Foundational, all parallel; must fail before T016–T019.
- **US1 core (T016–T019)**: T016 after T011–T012; T017, T018 parallel; T019 after T015.
- **US1 UI (T020–T028)**: T020 after T019; T021–T023, T026 parallel after T016–T018; T024 after T020–T023; T025 after T024; T027 after T020 + T026; T028 any time after T005.
- **Polish (T029–T032)**: T029 parallel; T030 after T029; T031 after everything; T032 last.

## Parallel Example: User Story 1

```text
# Tests together:
T012 parse-csv.test.ts | T013 set-name.test.ts | T014 build-word-set.test.ts | T015 indexeddb-repository.test.ts

# Pure logic together (after tests):
T017 set-name.ts | T018 build-word-set.ts

# UI components together:
T021 CsvFilePicker | T022 ImportPreview | T023 SetNameField | T026 WordSetList + EmptyState
```

## Implementation Strategy

1. Setup + Foundational → build i narzędzia działają.
2. US1: testy → logika → repozytorium → UI → **STOP i walidacja** wg quickstart.md (MVP).
3. Kolejne iteracje: US2 (lista: zmiana nazwy, usuwanie, wybór źródła), US3 (edycja par),
   US4 (aktualizacja z pliku), US5 (zestaw przykładowy) — nowe `/speckit-tasks` na tym samym
   rdzeniu i kontrakcie repozytorium.
