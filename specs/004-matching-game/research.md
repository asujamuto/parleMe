# Research: Dopasowywanie na czas (P1)

## R1. Logika rundy jako czysty reducer

- **Decision**: `matchingReducer(state, action)` z akcjami `select(tileId, now)` i `clearFeedback`;
  czas wstrzykiwany (`now`), losowość wstrzykiwana (`random`) w `selectPairs` i `createBoard`.
- **Rationale**: Konstytucja IV/V — deterministyczne testy reguł (para, błąd, ten sam język,
  odznaczenie, koniec rundy) bez przeglądarki; ten sam wzorzec co fiszki (002).

## R2. Wybór par bez dwuznaczności

- **Decision**: Słówka tasowane, a potem wybierane zachłannie do 6 par z pominięciem tych, których
  tekst włoski **lub** polski (po `trim`, zwinięciu spacji, `toLocaleLowerCase('pl')`) już wystąpił.
  Gdy wyjdzie < 2 pary, ekran startu informuje o zbyt małej liczbie różnych słówek.
- **Rationale**: FR-004/SC-004 — każdy kafelek ma dokładnie jeden odpowiednik (np. „prego” i
  „per favore” → „proszę” nie trafią razem na planszę).

## R3. Czas i kara

- **Decision**: Czas = `(finishedAt ?? now) − startedAt + mistakes × 1000 ms`, liczony z zegara
  rzeczywistego (nie z liczby „tyknięć”) — odporny na przejście do innej karty. Wyświetlanie co
  100 ms (`setInterval`), format „12,3 s” (przecinek dziesiętny).

## R4. Plansza i dostępność

- **Decision**: Kafelek = `<button>` z `aria-pressed` (zaznaczenie) i `lang` tekstu; dopasowany
  kafelek zostaje w siatce jako niewidoczny element (`invisible`, `aria-hidden`) — układ się nie
  przesuwa (FR-007). Błąd: czerwona ramka + drgnięcie framer-motion (pominięte przy
  `useReducedMotion()`), zdejmowane po 500 ms akcją `clearFeedback`. Komunikaty `aria-live`:
  „Para!”, „Błąd, plus 1 sekunda”.
- **Rationale**: FR-016/FR-017; ten sam wzorzec ogłoszeń co w fiszkach.

## R5. Trasa

- **Decision**: Statyczna `app/matching/page.tsx` z `?set=<id>` (jak `/flashcards`), dodana do
  `PRECACHE_PAGES` service workera (wersja cache `v4`).
