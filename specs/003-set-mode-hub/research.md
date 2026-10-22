# Research: Panel zestawu z kafelkami trybów

## R1. Panel na istniejącej stronie zestawu

- **Decision**: Przebudowa `app/set/page.tsx` (`/set?id=`) zamiast nowej trasy.
- **Rationale**: Jedno miejsce „wejścia w zestaw” (spec, założenie); strona jest już statyczna i
  w cache service workera (offline, FR-013); istniejące linki do `/set?id=` działają dalej.

## R2. Katalog trybów jako dane

- **Decision**: `STUDY_MODES` — tablica wpisów `{ id, name, description, status, minWords }` w
  stałej kolejności; czysta funkcja `getTileState(mode, wordCount)` →
  `'available' | 'coming-soon' | 'too-few-words'`; `modeHref(mode, setId)` dla dostępnych.
  Ikony mapowane w komponencie (logika bez zależności od UI).
- **Rationale**: Zasada IV — nowy tryb włącza się zmianą `status` i dodaniem trasy; reguły
  testowalne bez renderowania (zasada V).

## R3. Kafelki niedostępne

- **Decision**: Kafelek dostępny = `<Link>` (cały kafelek klikalny, ≥ 44 px). Niedostępny =
  element nieinteraktywny (`<div aria-disabled="true">`) z widocznym tekstem „Wkrótce” albo
  „Wymaga co najmniej N słówek”; nie jest w kolejności Tab.
- **Rationale**: SC-003 — brak możliwości uruchomienia; czytnik ekranu odczytuje nazwę i powód.

## R4. Ostatni tryb zestawu

- **Decision**: `localStorage`, klucz `parleme.lastModeBySet`, JSON `{ [setId]: modeId }`;
  odczyt odporny na brak/uszkodzony JSON; zapis przy starcie trybu; usunięcie zestawu usuwa jego
  wpis. Nieznany `modeId` jest ignorowany.
- **Rationale**: Wygoda bez wpływu na dane nauki; spójne z `lastStudiedSetId` i kierunkiem fiszek.

## R5. Powrót z trybu na panel

- **Decision**: Fiszki dostają `exitHref = /set?id=<setId>`: „Zakończ”, „Wróć do zestawu” w
  podsumowaniu i link powrotu w nagłówku prowadzą na panel (FR-009).
