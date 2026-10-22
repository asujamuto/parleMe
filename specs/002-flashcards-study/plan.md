# Implementation Plan: Tryb fiszek na zaimportowanych zestawach — zakres P1

**Branch**: `002-flashcards-study` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-flashcards-study/spec.md`

**Note**: Plan obejmuje **User Story 1 (P1) — sesja fiszek na wybranym zestawie** oraz
usunięcie demo lekcji (FR-017, FR-018). US2 (zapisywany postęp) i US3 (kierunek PL → IT) w
kolejnych iteracjach — model danych i kontrakt są na nie przygotowane.

## Summary

Przy każdym zestawie na liście pojawia się akcja „Fiszki” prowadząca do
`/flashcards?set=<id>`. Sesja wczytuje słówka zestawu z repozytorium z funkcji 001 i
prowadzi rundę (maks. 20 kart): karta → odwrócenie → „Znam” / „Nie znam”, karty „Nie znam”
wracają na koniec kolejki, na końcu podsumowanie. Logika rundy to czysty reducer w
`lib/flashcards/` z testami; UI to karta z animacją framer-motion (wyłączaną przy ograniczeniu
ruchu) i obsługą klawiatury. Demo lekcji z kartami na sztywno zostaje usunięte, a stare adresy
przekierowane na listę zestawów.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict)

**Primary Dependencies**: Next.js 15.5 (App Router), React 18.2, shadcn/ui, framer-motion 11
(już w projekcie), rdzeń `lib/word-sets/` z funkcji 001

**Storage**: Odczyt zestawów z IndexedDB (repozytorium 001); P1 nie zapisuje nic nowego

**Testing**: Vitest — `tests/unit/flashcards/session.test.ts`; UI ręcznie wg
[quickstart.md](quickstart.md)

**Target Platform**: Przeglądarki mobilne i desktopowe, offline po pierwszym załadowaniu

**Project Type**: Aplikacja webowa, tylko front-end

**Performance Goals**: Pierwsza karta < 1 s od wybrania „Fiszki” (SC-001); animacja 60 fps

**Constraints**: 360 px, cele ≥ 44 px, pełna obsługa klawiaturą, `prefers-reduced-motion`

**Scale/Scope**: Runda ≤ 20 kart; zestawy do 2000 słówek; 1 nowy ekran

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Zasada | Jak plan ją spełnia | Status |
|--------|---------------------|--------|
| I. CSV jako źródło | fiszki tylko ze słówek zaimportowanych zestawów; demo z kartami w kodzie usunięte | ✅ |
| II. Local-first | odczyt z IndexedDB, brak sieci; działa pod istniejącym service workerem | ✅ |
| III. Nauka przez zabawę | runda ≤ 20 kart (~3 min), natychmiastowa reakcja, poprawna odpowiedź widoczna po odwróceniu, powtórki trudnych kart w rundzie; zapis postępu między sesjami — US2 | ✅ (P1) |
| IV. Wspólny rdzeń | korzysta z `WordEntry`/repozytorium 001; logika rundy w `lib/flashcards/` jako czyste funkcje | ✅ |
| V. Testy logiki | testy reducera, kolejki, podsumowania, formatowania czasu | ✅ |
| VI. Mobile-first, a11y | karta jako `<button>`, `lang="it"`, `aria-live`, klawiatura, reduced motion, 44 px | ✅ |
| VII. Prostota | brak nowych zależności (framer-motion już jest); brak biblioteki maszyn stanów | ✅ |

**Re-check po Phase 1**: brak naruszeń.

## Project Structure

### Documentation (this feature)

```text
specs/002-flashcards-study/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/flashcard-session.md
└── tasks.md
```

### Source Code (repository root)

```text
lib/flashcards/session.ts                     # NEW: reducer, kolejka, podsumowanie
hooks/use-word-sets.ts                        # MODIFY: + useWordSet(setId)
app/flashcards/page.tsx                       # NEW: trasa sesji (?set=<id>, statyczna)
app/components/flashcards/
├── FlashcardSession.tsx                      # NEW: useReducer + klawiatura + nagłówek postępu
├── FlipCard.tsx                              # NEW: karta z animacją / reduced motion
└── SessionSummary.tsx                        # NEW: podsumowanie rundy
app/components/word-sets/WordSetList.tsx      # MODIFY: akcja „Fiszki” przy zestawie
next.config.js                                # MODIFY: redirects /:lesson(\d+) → /
tests/unit/flashcards/session.test.ts         # NEW

# DELETE (demo, FR-017):
app/[slug]/  app/components/study-session.tsx  app/components/ui/flashcard.tsx
app/data/initial-cards.ts  app/data/lessons.ts  app/types/flashcard.ts  app/types/lesson.ts
```

**Structure Decision**: Ten sam pojedynczy projekt Next.js co 001. Nowy moduł domenowy
`lib/flashcards/` obok `lib/word-sets/`; komponenty trybu w `app/components/flashcards/`.

## Complexity Tracking

Brak naruszeń konstytucji — sekcja nie dotyczy.
