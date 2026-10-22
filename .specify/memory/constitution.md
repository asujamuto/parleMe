<!--
Sync Impact Report
- Wersja: (szablon, brak wersji) → 1.0.0 (pierwsza ratyfikacja)
- Zasady: wszystkie placeholdery zastąpione; dodano 7 zasad (I–VII) zamiast 5 z szablonu
- Dodane sekcje: Ograniczenia techniczne; Proces pracy i bramki jakości
- Usunięte sekcje: brak
- Szablony (.specify/templates/*): bez zmian — czytają konstytucję w czasie działania
- TODO: brak
-->
# parleMe Constitution

## Core Principles

### I. CSV jako źródło słówek

Jedynym źródłem treści do nauki są zestawy słówek importowane przez użytkownika z pliku CSV.

- Minimalny, zawsze wspierany format: nagłówki `italian`, `polish` (UTF-8, wiersz = para słów).
- Import MUST walidować dane schematem Zod (wspólny schemat w `utils/`), przycinać białe znaki,
  pomijać puste wiersze i zgłaszać błędy po polsku z numerem wiersza.
- Dodatkowe, opcjonalne kolumny (np. przykładowe zdanie) MAY zostać wprowadzone w specyfikacji
  funkcji, ale plik z samymi dwiema kolumnami MUST nadal działać we wszystkich trybach.
- Treść wbudowana w kod jest dozwolona wyłącznie jako zestaw demonstracyjny.

### II. Local-first i prywatność

Aplikacja MUST działać w pełni bez konta i bez połączenia z siecią po załadowaniu.

- Zestawy słówek i postępy nauki są przechowywane w przeglądarce (IndexedDB lub localStorage)
  za jedną warstwą repozytorium, aby w przyszłości można było podmienić magazyn danych.
- Żadne dane użytkownika nie opuszczają urządzenia. Brak analityki zewnętrznej.
- Backend (w tym istniejący katalog `amplify/`) MUST NOT być używany przez nowe funkcje bez
  wcześniejszej poprawki tej konstytucji.
- Użytkownik MUST mieć możliwość eksportu i usunięcia swoich danych.

### III. Nauka przez zabawę („brainrot”, ale skutecznie)

Każdy tryb (gra lub zadanie) MUST być krótki, dynamiczny i natychmiast nagradzający.

- Pojedyncza runda trwa domyślnie ≤ 3 minuty i da się ją przerwać w dowolnym momencie.
- Każda odpowiedź daje natychmiastowy feedback (wizualny + opcjonalnie dźwięk) i pokazuje
  poprawną odpowiedź po błędzie.
- Każdy tryb MUST ćwiczyć co najmniej jedno z: rozpoznawanie znaczenia, przypominanie słowa,
  użycie słowa w zdaniu. Mechanika, która nie uczy, nie wchodzi do aplikacji.
- Wynik rundy aktualizuje wspólny postęp słówek (patrz IV), aby trudne słowa wracały częściej.

### IV. Wspólny rdzeń, wymienne tryby

Fiszki, dopasowywanie na czas, uzupełnianie zdań i gry (np. Word Tower, Grammar Runner) to
niezależne moduły korzystające ze wspólnego rdzenia.

- Rdzeń: model słówka, zestawy, zapis postępu i dobór słów do powtórki — jeden kod,
  używany przez wszystkie tryby.
- Logika trybu (stan gry, punktacja, generowanie pytań, losowanie dystraktorów) MUST być
  czystymi funkcjami TypeScript, oddzielonymi od renderowania i animacji.
- Dodanie nowego trybu MUST NOT wymagać zmian w innych trybach.

### V. Testy logiki (NON-NEGOTIABLE)

Czysta logika MUST mieć testy jednostkowe uruchamiane jednym poleceniem (`npm test`).

- Obowiązkowo testowane: parsowanie i walidacja CSV, zapis/odczyt postępu, algorytm
  powtórek, generowanie pytań i dystraktorów, punktacja i reguły każdej gry.
- Testy powstają razem z kodem logiki w tym samym zadaniu; zmiana logiki bez testu nie jest
  ukończona.
- Komponenty UI i animacje są weryfikowane ręcznie wg scenariusza z `quickstart.md` funkcji;
  testy UI są opcjonalne.

### VI. Mobile-first i dostępność

Każdy ekran jest projektowany najpierw na telefon w pionie (szerokość od 360 px).

- Główne sterowanie: dotyk (cele ≥ 44 px). Każdy tryb MUST być też grywalny klawiaturą.
- Animacje płynne (cel 60 fps na średnim telefonie); `prefers-reduced-motion` MUST wyłączać
  lub upraszczać ruch.
- Interfejs po polsku; słowa włoskie oznaczone `lang="it"`. Kontrast zgodny z WCAG AA,
  tryb jasny i ciemny.

### VII. Prostota

Zaczynamy od najprostszego rozwiązania, które realizuje specyfikację (YAGNI).

- Najpierw istniejący stos i komponenty z `components/ui/`; nowa zależność wymaga
  uzasadnienia w `plan.md` (dlaczego istniejące narzędzia nie wystarczą).
- Gry budujemy na React + framer-motion / Canvas; silnik gier tylko wtedy, gdy plan wykaże,
  że bez niego wymagania wydajnościowe z zasady VI nie są osiągalne.

## Ograniczenia techniczne

- Stos: Next.js (App Router), React, TypeScript (strict), Tailwind CSS, shadcn/ui (Radix),
  framer-motion, Zod, PapaParse do parsowania CSV w przeglądarce.
- Aplikacja działa jako front-end bez serwera danych; kod Node-only (np. `fs`) nie może
  trafiać do ścieżek wykonywanych w przeglądarce.
- Kod, nazwy plików i identyfikatory po angielsku; teksty UI i komunikaty błędów po polsku.
- Runner testów: Vitest (ustalany w pierwszym planie funkcji, jeśli jeszcze nie istnieje).

## Proces pracy i bramki jakości

- Każda funkcja przechodzi ścieżkę Spec Kit: `/speckit-specify` → (`/speckit-clarify`) →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Sekcja „Constitution Check” w `plan.md` MUST odnieść się do każdej zasady I–VII;
  odstępstwa trafiają do „Complexity Tracking” z uzasadnieniem.
- Funkcja jest gotowa, gdy: `npm run lint`, `npm test` i `npm run build` przechodzą, a
  scenariusz ręczny na telefonie (lub emulacji 360 px) i klawiaturą został wykonany.

## Governance

- Konstytucja ma pierwszeństwo przed innymi praktykami i dokumentami w repozytorium.
- Poprawki wprowadza się przez `/speckit-constitution`, z Sync Impact Report i opisem
  zmiany w commicie.
- Wersjonowanie semantyczne: MAJOR — usunięcie lub zmiana znaczenia zasady; MINOR — nowa
  zasada lub sekcja albo istotne rozszerzenie; PATCH — doprecyzowania i redakcja.
- Każdy plan i przegląd zmian weryfikuje zgodność z konstytucją; złożoność wykraczająca poza
  zasady wymaga pisemnego uzasadnienia.

**Version**: 1.0.0 | **Ratified**: 2026-10-22 | **Last Amended**: 2026-10-22
