# Research: Import CSV i zarządzanie zestawami słówek (zakres P1)

Wszystkie decyzje dotyczą User Story 1 (import pliku CSV). Decyzje oznaczone „(dalej)” są
przygotowaniem pod US2–US5 i przyszłe tryby, bez ich implementacji w P1.

## R1. Backend vs. przechowywanie lokalne

- **Decision**: Brak backendu w tej funkcji. Dane w przeglądarce (IndexedDB) za interfejsem
  `WordSetRepository`.
- **Rationale**: Konstytucja v1.0.0, zasada II (local-first) zabrania użycia backendu bez jej
  poprawki. Użytkownik zasygnalizował chęć użycia NestJS, ale decyzja nie została potwierdzona
  poprawką konstytucji. Interfejs repozytorium pozwala później dodać implementację
  synchronizowaną z API (np. NestJS) bez zmian w logice importu i UI.
- **Alternatives considered**: NestJS + baza danych od razu — odrzucone na teraz: narusza
  zasadę II, wymaga kont, hostingu i poprawki konstytucji (MAJOR 2.0.0); do rozważenia jako
  osobna funkcja (002) po MVP.

## R2. Magazyn danych w przeglądarce

- **Decision**: IndexedDB przez bibliotekę `idb` (~1 kB, obietnice zamiast callbacków).
- **Rationale**: Limit localStorage (~5 MB, synchroniczny, tylko stringi) przy 2000 parach na
  zestaw i wielu zestawach jest realnym ryzykiem. IndexedDB daje transakcje (zestaw i słówka
  zapisywane atomowo — FR-008, brak częściowych zapisów), indeksy (`setId`) i większy limit.
  `idb` jest minimalną, typowaną nakładką — uzasadnienie nowej zależności (zasada VII).
- **Alternatives considered**: localStorage (prostsze, ale limit i brak atomowości przy dwóch
  kluczach); `idb-keyval` (za proste — brak indeksów i transakcji wielu magazynów); Dexie
  (więcej możliwości niż potrzeba, ~25 kB).

## R3. Parsowanie CSV

- **Decision**: PapaParse (już w zależnościach) w przeglądarce, `header: true`,
  `transformHeader` (usunięcie BOM, `trim`, `toLowerCase`), `delimitersToGuess: [',', ';']`,
  `skipEmptyLines: false` (zachowanie numeracji wierszy). Walidacja wierszy schematem Zod w
  `utils/csvParserSchema.ts` (zasada I).
- **Rationale**: PapaParse poprawnie obsługuje cudzysłowy, przecinki w wartościach, CRLF i
  autodetekcję separatora; działa także w Node, więc parser da się testować jednostkowo.
  Sprawdzone pliki ITA5: wszystkie mają BOM i CRLF, a jeden nagłówek ` polish` ze spacją —
  normalizacja nagłówków jest konieczna (obecny `utils/fileUploadHandler.ts` by go odrzucił).
- **Alternatives considered**: `zod-csv` (obecnie w kodzie, słaba kontrola nad komunikatami i
  numerami wierszy); `csv-parser` (tylko Node — zakazane w ścieżkach przeglądarki).

## R4. Numeracja wierszy i puste wiersze

- **Decision**: Numer wiersza = numer linii rekordu w pliku tak, jak w arkuszu (nagłówek = 1,
  pierwszy rekord = 2). Wiersz w pełni pusty w środku pliku → pominięty z przyczyną „Pusty
  wiersz”. Puste wiersze na końcu pliku (np. końcowy znak nowej linii) ignorowane bez
  komunikatu.
- **Rationale**: Użytkownik poprawia plik w arkuszu, więc numery muszą się zgadzać z tym, co
  widzi. Końcowy enter jest w każdym z plików ITA5 — zgłaszanie go byłoby szumem.
- **Note**: Pole w cudzysłowie zawierające znak nowej linii przesuwa numerację; akceptowane
  (rzadkie dla list słówek).

## R5. Powtórzenia

- **Decision**: Klucz pary = `italian` i `polish` po `trim`, zwinięciu wielokrotnych spacji i
  `toLocaleLowerCase('pl')`. Pierwsze wystąpienie zostaje, kolejne trafiają do raportu jako
  powtórzenie z numerem wiersza oryginału. Zapisany tekst pozostaje oryginalny (tylko `trim`).
- **Rationale**: FR-006; zachowanie treści znak po znaku (SC-002).

## R6. Identyfikatory

- **Decision**: `crypto.randomUUID()` dla zestawu i każdego słówka; generator wstrzykiwany do
  czystych funkcji (deterministyczne testy).
- **Rationale**: FR-020 (stałe ID niezależne od treści i pozycji); przyszła synchronizacja z
  backendem nie wymaga ID nadawanych przez serwer.

## R7. Testy i jakość

- **Decision**: Vitest (środowisko `node`) + `fake-indexeddb` dla testów repozytorium. Skrypt
  `npm test` = `vitest run`. Konfiguracja ESLint `next/core-web-vitals`; `eslint-config-next`
  podniesiony do wersji zgodnej z Next 15.5.
- **Rationale**: Zasada V i bramki jakości (lint, test, build). Obecnie brak konfiguracji
  ESLint (`next lint` pyta interaktywnie), a `eslint-config-next` 13.5.1 nie pasuje do Next
  15.5.4.

## R8. Stan istniejącego kodu (wymagane porządki, aby przejść bramkę `npm run build`)

- `app/layout.tsx`, `app/page.tsx`, `app/components/custom/providers/Provider.tsx` importują
  `amplify_outputs.json`, którego nie ma w repozytorium → build nie przechodzi. Importy
  Amplify zostają usunięte; `app/[slug]/page.tsx` traci zapytanie do Amplify (pozostaje jako
  dotychczasowe demo fiszek, do zastąpienia w funkcji „Fiszki”). Katalog `amplify/` bez zmian.
- `app/data/csvParser.ts` (Node `fs` + kod wykonywany przy imporcie modułu),
  `utils/fileUploadHandler.ts`, `app/components/custom/CsvTableUploader.tsx`,
  `app/components/custom/ProfileForm.tsx` — zastąpione nowym przepływem importu, usuwane.
- Zależności do usunięcia: `csv-parser`, `zod-csv`, `aws-amplify` (nieużywane po porządkach).
- `next.config.js`: opcja `swcMinify` nie istnieje w Next 15 — usunięcie. `<html lang="en">`
  → `lang="pl"` (zasada VI).

## R9. Wydajność podglądu (SC-003)

- **Decision**: Parsowanie całego pliku jednorazowo; podgląd renderuje pierwsze 100 par z
  przyciskiem „Pokaż wszystkie (N)”. Lista pominiętych wierszy renderowana w całości.
- **Rationale**: Parsowanie 2000 wierszy to milisekundy; wąskim gardłem na telefonie byłoby
  renderowanie 2000 elementów naraz.

## R10. Ponowne otwarcie aplikacji offline (US1 scenariusz 5, SC-006)

- **Decision**: Ręcznie napisany, minimalny service worker `public/sw.js` (bez zależności),
  rejestrowany tylko w buildzie produkcyjnym: nawigacje „network-first” z kopią w cache,
  zasoby `/_next/static/*` „cache-first” (pliki z hashem w nazwie). Wersja cache podbijana
  stałą w pliku.
- **Rationale**: IndexedDB zachowuje dane, ale bez service workera strona nie otworzy się bez
  sieci. Konstytucja (II) wymaga działania offline; ręczny SW (~50 linii) jest prostszy niż
  dodawanie pakietu PWA (zasada VII).
- **Alternatives considered**: `@serwist/next` / `next-pwa` (dodatkowa zależność i konfiguracja
  buildu dla jednej strony + importu); `output: 'export'` (wymaga przebudowy trasy `[slug]`,
  poza zakresem P1).
