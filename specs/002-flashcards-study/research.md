# Research: Tryb fiszek (zakres P1)

## R1. Logika sesji jako czysty reducer

- **Decision**: Stan sesji i przejścia (`flip`, `rate`, `restart`) jako czyste funkcje w
  `lib/flashcards/session.ts`, używane w UI przez `useReducer`.
- **Rationale**: Konstytucja IV/V — logika trybu oddzielona od renderowania i testowana
  jednostkowo. Reducer daje deterministyczne testy kolejki powtórek (FR-006) bez przeglądarki.
- **Alternatives considered**: Stan w komponencie (`useState` jak w demo) — nietestowalny bez
  renderowania; biblioteka maszyn stanów (XState) — zbędna zależność (zasada VII).

## R2. Kolejka powtórek w rundzie

- **Decision**: Kolejka identyfikatorów słówek; „Znam” usuwa kartę z kolejki, „Nie znam”
  przenosi ją na koniec. Pierwsza ocena każdej karty jest zapamiętywana osobno (do podsumowania i
  przyszłego postępu z US2).
- **Rationale**: Przeniesienie na koniec spełnia FR-006 (karta wraca po wszystkich jeszcze
  niepokazanych) i scenariusz 5 (wraca ponownie, dopóki nie „Znam”).

## R3. Dobór kart do rundy w P1

- **Decision**: Maks. 20 kart (FR-009); w P1, bez zapisanego postępu, wybierane są pierwsze 20
  słówek wg pozycji w pliku — to zgodne z regułą FR-012 dla słówek „nigdy nie pokazanych”.
  Priorytety oparte na postępie dojdą w US2 jako argument funkcji tworzącej sesję.

## R4. Trasa i przekierowanie demo

- **Decision**: Nowa statyczna trasa `app/flashcards/page.tsx` z zestawem w parametrze
  `?set=<id>` (nie dynamiczny segment `[setId]`: strona dynamiczna nie byłaby dostępna offline
  dla zestawów nieotwartych wcześniej online; statyczną stronę service worker zapisuje w cache
  przy instalacji i dopasowuje bez parametrów). Usunięcie `app/[slug]/`
  oraz kodu demo (`initial-cards`, `lessons`, `study-session`, `ui/flashcard`, typy
  `Flashcard`/`Lesson`). Stare adresy `/<liczba>` → `/` przez `redirects()` w `next.config.js`
  (przekierowanie tymczasowe).
- **Rationale**: FR-017, FR-018, SC-006. Przekierowanie w konfiguracji nie wymaga strony, która
  przechwytywałaby wszystkie adresy jednego segmentu.

## R5. Animacja karty i dostępność

- **Decision**: Karta to jeden element `<button>` pokazujący tylko bieżącą stronę; zmiana strony
  animowana framer-motion (obrót ~90° → 0°, 250 ms), wyłączona przy `useReducedMotion()`.
  Odwrócona strona ogłaszana przez region `aria-live="polite"`. Klawisze obsługiwane globalnie
  (`keydown` na `window`): spacja/Enter odwraca (pomijane, gdy fokus jest na przycisku — wtedy
  działa natywne kliknięcie), strzałki i `1`/`2` oceniają. Po ocenie fokus wraca na kartę.
- **Rationale**: Demo renderowało obie strony naraz (`backface-visibility`) — czytnik ekranu
  czytał tłumaczenie przed odwróceniem. Jedna strona w DOM = brak „podpowiedzi” i prostszy kod.
- **Alternatives considered**: Animacja CSS 3D z dwiema stronami (problem dostępności powyżej).

## R6. Rozmiar tekstu

- **Decision**: Rozmiar czcionki zależny od długości tekstu (≤ 30 znaków `text-3xl`, ≤ 80
  `text-2xl`, dłuższe `text-xl`), `break-words`, karta o minimalnej wysokości zamiast stałej.
- **Rationale**: Pliki ITA5 zawierają całe zdania; stała wysokość z demo (`h-64`) ucinałaby je.
