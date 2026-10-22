# Implementation Plan: Panel zestawu z kafelkami trybów nauki

**Branch**: `003-set-mode-hub` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-set-mode-hub/spec.md`

## Summary

Strona zestawu `/set?id=<id>` (z 001) staje się panelem zestawu: nagłówek z postępem, siatka 4
kafelków trybów z katalogu trybów (dostępne: Fiszki; „Wkrótce”: Italian Word Tower,
Dopasowywanie na czas, Grammar Runner), a pod spodem dotychczasowa lista słówek i akcje zestawu.
Lista zestawów prowadzi na panel („Ucz się”), fiszki wracają na panel, a ostatnio użyty tryb
jest oznaczony „Ostatnio” (osobno dla każdego zestawu). Katalog trybów i reguły dostępności to
czyste funkcje z testami; nowe tryby włącza się zmianą statusu w katalogu.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict)

**Primary Dependencies**: Next.js 15.5 (App Router), React 18.2, shadcn/ui, lucide-react; rdzeń
`lib/word-sets/`, `lib/progress/`, `lib/preferences/`

**Storage**: Bez zmian w IndexedDB; ostatni tryb zestawu w `localStorage`
(`parleme.lastModeBySet`, JSON `{ [setId]: modeId }`)

**Testing**: Vitest — `tests/unit/modes/catalog.test.ts`, `tests/unit/preferences/last-mode.test.ts`

**Target Platform**: Przeglądarki mobilne i desktopowe, offline po pierwszym załadowaniu

**Project Type**: Aplikacja webowa, tylko front-end

**Performance Goals**: Panel < 1 s od wyboru zestawu (SC-002)

**Constraints**: 360 px (min. 2 kolumny kafelków), cele ≥ 44 px, klawiatura, offline

**Scale/Scope**: 1 przebudowany ekran (`/set`), zmiany w liście zestawów i fiszkach

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Zasada | Jak plan ją spełnia | Status |
|--------|---------------------|--------|
| I. CSV jako źródło | panel tylko odczytuje zestawy z importu | ✅ |
| II. Local-first | brak sieci; `/set` już w cache service workera | ✅ |
| III. Nauka przez zabawę | panel prowadzi do trybów; nieaktywne tryby nie uruchamiają pustej mechaniki | ✅ |
| IV. Wspólny rdzeń, wymienne tryby | katalog trybów `lib/modes/catalog.ts` — nowy tryb = wpis w katalogu, bez zmian w innych trybach | ✅ |
| V. Testy logiki | testy katalogu (stan kafelka, kolejność, adresy) i preferencji ostatniego trybu | ✅ |
| VI. Mobile-first, a11y | siatka 2 kolumn od 360 px, kafelki-linki ≥ 44 px, `aria-disabled` + tekst „Wkrótce” | ✅ |
| VII. Prostota | brak nowych zależności; brak migracji bazy (preferencja w `localStorage`) | ✅ |

**Re-check po Phase 1**: brak naruszeń.

## Project Structure

### Documentation (this feature)

```text
specs/003-set-mode-hub/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/mode-catalog.md
└── tasks.md
```

### Source Code (repository root)

```text
lib/modes/catalog.ts                          # NEW: katalog trybów, getTileState, modeHref
lib/preferences/last-mode.ts                  # NEW: ostatni tryb zestawu (localStorage)
hooks/use-last-mode.ts                        # NEW
app/components/modes/ModeTiles.tsx            # NEW: siatka kafelków
app/set/page.tsx                              # MODIFY: panel (nagłówek, kafelki, słówka, akcje)
app/components/word-sets/WordSetList.tsx      # MODIFY: „Ucz się” → panel zamiast „Fiszki”
app/flashcards/page.tsx                       # MODIFY: powrót na panel, zapis ostatniego trybu
app/components/flashcards/FlashcardSession.tsx, SessionSummary.tsx  # MODIFY: exitHref
hooks/use-word-sets.ts                        # MODIFY: deleteSet czyści ostatni tryb zestawu
tests/unit/modes/catalog.test.ts              # NEW
tests/unit/preferences/last-mode.test.ts      # NEW
```

**Structure Decision**: Ten sam pojedynczy projekt Next.js. Katalog trybów w `lib/modes/` jako
wspólny punkt rejestracji trybów dla kolejnych specyfikacji gier.

## Complexity Tracking

Brak naruszeń konstytucji — sekcja nie dotyczy.
