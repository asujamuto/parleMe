# Implementation Plan: Dopasowywanie na czas — zakres P1

**Branch**: `004-matching-game` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-matching-game/spec.md`

**Note**: Plan obejmuje **User Story 1 (P1)** — rundę dopasowywania na czas, włączenie kafelka
na panelu zestawu i oznaczenie „Ostatnio”. US2 (rekord) i US3 (postęp) w kolejnych iteracjach.

## Summary

Kafelek „Dopasowywanie na czas” na panelu zestawu (003) staje się dostępny i prowadzi do
`/matching?set=<id>`. Ekran startu → plansza 12 kafelków (6 par, bez par o powtarzającym się
tekście) → zaznaczanie i rozstrzyganie prób (para znika / błąd +1 s) → wynik z czasem i
błędami. Logika rundy to czysty reducer w `lib/matching/game.ts` z testami; UI to siatka
przycisków z animacją błędu (wyłączaną przy ograniczeniu ruchu) i stoperem odświeżanym co 0,1 s.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict)

**Primary Dependencies**: Next.js 15.5, React 18.2, shadcn/ui, framer-motion (już w projekcie);
rdzeń `lib/word-sets/`, katalog `lib/modes/catalog.ts`, preferencje `lib/preferences/last-mode.ts`

**Storage**: P1 nic nie zapisuje poza ostatnim trybem zestawu (`localStorage`, z 003)

**Testing**: Vitest — `tests/unit/matching/game.test.ts`, aktualizacja `tests/unit/modes/catalog.test.ts`

**Target Platform**: Przeglądarki mobilne i desktopowe, offline po pierwszym załadowaniu

**Project Type**: Aplikacja webowa, tylko front-end

**Performance Goals**: Plansza < 1 s od „Start”; stoper płynnie co 0,1 s

**Constraints**: 360 px (2 kolumny kafelków, od `sm` 3, od `md` 4), cele ≥ 44 px, klawiatura,
`prefers-reduced-motion`, offline

**Scale/Scope**: 1 nowy ekran; runda ≤ 6 par

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Zasada | Jak plan ją spełnia | Status |
|--------|---------------------|--------|
| I. CSV jako źródło | pary wyłącznie ze słówek zestawu | ✅ |
| II. Local-first | brak sieci; `/matching` w cache service workera | ✅ |
| III. Nauka przez zabawę | runda < 1 min, natychmiastowa reakcja, kara za błąd, wynik; aktualizacja postępu — US3 | ✅ (P1) |
| IV. Wspólny rdzeń | `WordEntry` z 001, kafelek przez katalog trybów (003); logika w `lib/matching/` jako czyste funkcje | ✅ |
| V. Testy logiki | testy wyboru par, planszy, reducera, czasu i formatowania | ✅ |
| VI. Mobile-first, a11y | przyciski z `aria-pressed`, `lang="it"`, `aria-live`, reduced motion, 44 px | ✅ |
| VII. Prostota | brak nowych zależności | ✅ |

**Re-check po Phase 1**: brak naruszeń.

## Project Structure

```text
specs/004-matching-game/  plan.md research.md data-model.md quickstart.md contracts/matching-game.md tasks.md

lib/matching/game.ts                       # NEW: selectPairs, createBoard, matchingReducer, elapsedMs, formatSeconds
lib/modes/catalog.ts                       # MODIFY: matching → available, modeHref
app/matching/page.tsx                      # NEW: trasa (?set=), ekran startu, gra, wynik
app/components/matching/MatchingGame.tsx   # NEW: plansza + stoper + Zakończ
app/components/matching/MatchingResult.tsx # NEW: wynik rundy
public/sw.js                               # MODIFY: precache /matching, v4
tests/unit/matching/game.test.ts           # NEW
tests/unit/modes/catalog.test.ts           # MODIFY
```

**Structure Decision**: Moduł gry `lib/matching/` obok `lib/flashcards/`; komponenty w
`app/components/matching/`; trasa statyczna jak fiszki.

## Complexity Tracking

Brak naruszeń konstytucji — sekcja nie dotyczy.
