# Feature Specification: Panel zestawu z kafelkami trybów nauki

**Feature Branch**: `003-set-mode-hub`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Utwórz po wejściu w dany zestaw fiszek panel główny na którym będą się wyświetlać kafelki z różnymi trybami: 1. fiszki 2. Italian Word Tower (Tetris Słowny) strzelanie w klocki ze zgadzającym się słówkiem polskim (tak jak w quizlet) 3. Grammar Runner / Endless Dash (Bieg po Gramatyce) 4. dopasowywanie słówek polski - włoski na czas (tak jak w quizlet)"

## Clarifications

### Session 2026-10-22

- Q: Czy ta funkcja ma tylko dodać panel z kafelkami, czy także zaimplementować któryś z nowych
  trybów? → A: Tylko panel (opcja A) — dostępne „Fiszki”, pozostałe 3 tryby jako „Wkrótce”,
  każdy w osobnej specyfikacji.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Panel zestawu z kafelkami trybów (Priority: P1)

Uczący się wybiera zestaw z listy i trafia na panel tego zestawu. Na górze widzi nazwę zestawu,
liczbę słówek i postęp („Opanowane: X / N”), a pod spodem kafelki trybów nauki: „Fiszki”,
„Italian Word Tower”, „Dopasowywanie na czas” i „Grammar Runner”. Każdy kafelek ma ikonę, nazwę
i jednozdaniowy opis. Dotknięcie dostępnego kafelka uruchamia tryb na słówkach tego zestawu.
Tryby, które jeszcze nie są gotowe, są widoczne z oznaczeniem „Wkrótce” i nie da się ich
uruchomić.

**Why this priority**: Panel to jedno miejsce startu wszystkich trybów zestawu — bez niego
każdy nowy tryb wymagałby osobnych przycisków na liście zestawów. Daje użytkownikowi czytelny
wybór i pokazuje, co jeszcze nadchodzi.

**Independent Test**: Zaimportować zestaw ITA5 (18 słówek), dotknąć go na liście → panel z
4 kafelkami; „Fiszki” uruchamia fiszki tego zestawu; kafelki niedostępnych trybów są oznaczone
„Wkrótce” i nie reagują.

**Acceptance Scenarios**:

1. **Given** lista zestawów, **When** użytkownik wybiera zestaw, **Then** otwiera się panel tego
   zestawu z nazwą, „N słówek”, „Opanowane: X / N” i 4 kafelkami trybów w stałej kolejności:
   Fiszki, Italian Word Tower, Dopasowywanie na czas, Grammar Runner.
2. **Given** panel zestawu, **When** użytkownik wybiera kafelek „Fiszki”, **Then** startuje
   sesja fiszek tego zestawu (funkcja 002).
3. **Given** kafelek trybu oznaczony „Wkrótce”, **When** użytkownik go dotyka lub aktywuje
   klawiaturą, **Then** nic się nie uruchamia, a kafelek jest odczytywany przez czytnik ekranu
   jako niedostępny („Wkrótce”).
4. **Given** trwający tryb uruchomiony z panelu, **When** użytkownik go kończy (np. „Zakończ”
   albo „Wróć” w podsumowaniu), **Then** wraca na panel tego samego zestawu, a nie na listę
   zestawów.
5. **Given** panel zestawu, **When** użytkownik przewija w dół, **Then** widzi listę słówek
   zestawu oraz akcje „Zmień nazwę” i „Usuń” (z funkcji 001), działające jak dotychczas.

---

### User Story 2 - Wymagania trybu wobec zestawu (Priority: P2)

Niektóre tryby potrzebują minimalnej liczby słówek (np. dopasowywanie wymaga kilku par naraz).
Jeśli zestaw jest za mały, kafelek trybu jest nieaktywny i wyjaśnia dlaczego: „Wymaga co
najmniej 4 słówek”.

**Why this priority**: Zapobiega uruchomieniu trybu, który nie ma sensu na zbyt małym zestawie,
ale dotyczy tylko małych zestawów i trybów, które już działają.

**Independent Test**: Reguła dostępności kafelka sprawdzona testem jednostkowym dla zestawu z 3
słówkami i trybu z minimum 4 (w tej funkcji jedyny dostępny tryb — „Fiszki” — wymaga 1 słówka,
więc w interfejsie reguła stanie się widoczna wraz z pierwszym nowym trybem).

**Acceptance Scenarios**:

1. **Given** zestaw z 3 słówkami i dostępny tryb wymagający co najmniej 4, **When** użytkownik
   otwiera panel, **Then** kafelek jest nieaktywny z opisem „Wymaga co najmniej 4 słówek”.
2. **Given** ten sam zestaw, **When** użytkownik wybiera „Fiszki” (minimum 1 słówko), **Then**
   sesja startuje normalnie.

---

### User Story 3 - Ostatnio używany tryb (Priority: P3)

Uczący się wraca do zestawu i widzi na kafelku trybu, którego używał ostatnio, oznaczenie
„Ostatnio” — może jednym dotknięciem kontynuować naukę w ten sam sposób.

**Why this priority**: Wygoda przy regularnej nauce; panel działa bez tego.

**Independent Test**: Uruchomić fiszki zestawu, wrócić na panel (także po przeładowaniu) →
kafelek „Fiszki” ma oznaczenie „Ostatnio”.

**Acceptance Scenarios**:

1. **Given** użytkownik uruchomił tryb z panelu zestawu, **When** wraca na panel tego zestawu,
   **Then** kafelek tego trybu ma oznaczenie „Ostatnio”.
2. **Given** różne zestawy, **Then** oznaczenie „Ostatnio” jest zapamiętywane osobno dla każdego
   zestawu.

---

### Edge Cases

- Zestaw nie istnieje (usunięty, nieaktualny adres) — panel pokazuje „Nie znaleziono zestawu” z
  linkiem do listy.
- Zestaw z 1 słówkiem — panel działa; tryby z wyższym minimum są nieaktywne z wyjaśnieniem.
- Bardzo długa nazwa zestawu i długie opisy kafelków — tekst zawija się, bez przewijania w
  poziomie na ekranie 360 px.
- Tryb uruchomiony z panelu zostaje przerwany odświeżeniem strony — po powrocie użytkownik
  trafia na panel zestawu.
- Usunięcie zestawu z panelu — powrót na listę zestawów (jak w 001).
- Brak dostępu do pamięci przeglądarki — panel i tryby działają, tylko oznaczenie „Ostatnio” nie
  jest zapamiętywane.
- Stare adresy prowadzące bezpośrednio do szczegółów zestawu lub fiszek nadal działają.

## Requirements *(mandatory)*

### Functional Requirements

**Wejście na panel**

- **FR-001**: Wybranie zestawu na liście zestawów MUST otwierać panel tego zestawu; panel MUST
  mieć własny adres powiązany z zestawem.
- **FR-002**: Lista zestawów MUST mieć dla każdego zestawu jedną główną akcję prowadzącą do
  panelu („Ucz się”); bezpośredni przycisk „Fiszki” na liście zostaje zastąpiony panelem.
- **FR-003**: Nagłówek panelu MUST pokazywać nazwę zestawu, liczbę słówek i „Opanowane: X / N”.

**Kafelki trybów**

- **FR-004**: Panel MUST pokazywać 4 kafelki w stałej kolejności: „Fiszki”, „Italian Word
  Tower”, „Dopasowywanie na czas”, „Grammar Runner”; każdy z ikoną, nazwą i jednozdaniowym
  opisem po polsku.
- **FR-005**: Kafelek dostępnego trybu MUST uruchamiać ten tryb na słówkach tylko tego zestawu.
- **FR-006**: W tej funkcji dostępny jest wyłącznie tryb „Fiszki”; „Italian Word Tower”,
  „Dopasowywanie na czas” i „Grammar Runner” są oznaczone „Wkrótce” i zostaną zrealizowane w
  osobnych specyfikacjach (włączenie trybu = zmiana jego dostępności w katalogu trybów).
- **FR-007**: Kafelek trybu niedostępnego MUST być widoczny, oznaczony „Wkrótce”, nieaktywny
  (dotyk i klawiatura nic nie uruchamiają) i opisany jako niedostępny dla czytników ekranu.
- **FR-008**: Każdy tryb MUST mieć określoną minimalną liczbę słówek zestawu; gdy zestaw jest
  mniejszy, kafelek jest nieaktywny z komunikatem „Wymaga co najmniej N słówek” (Fiszki: 1).
- **FR-009**: Zakończenie lub opuszczenie trybu uruchomionego z panelu MUST prowadzić z powrotem
  na panel tego zestawu.
- **FR-010**: Kafelek ostatnio uruchomionego trybu w danym zestawie MUST mieć oznaczenie
  „Ostatnio”; zapamiętywane osobno dla każdego zestawu, między wizytami.

**Zarządzanie zestawem**

- **FR-011**: Panel MUST zawierać dotychczasowe funkcje strony zestawu z 001: listę słówek,
  „Zmień nazwę” i „Usuń”, umieszczone pod kafelkami trybów.

**Interfejs**

- **FR-012**: Kafelki MUST mieć cele dotyku ≥ 44 px, układ co najmniej 2 kolumn na ekranie od
  360 px, pełną obsługę klawiaturą (Tab, Enter/Spacja) i teksty po polsku.
- **FR-013**: Panel MUST działać offline po pierwszym załadowaniu aplikacji.

### Key Entities

- **Tryb nauki**: pozycja w katalogu trybów. Atrybuty: identyfikator, nazwa, opis, ikona,
  dostępność (dostępny / wkrótce), minimalna liczba słówek, miejsce uruchomienia.
- **Ostatni tryb zestawu**: zapamiętana para (zestaw → identyfikator trybu) dla oznaczenia
  „Ostatnio”.
- **Zestaw / Słówko / Postęp słówka**: z funkcji 001 i 002 — panel tylko je odczytuje (poza
  istniejącymi akcjami zmiany nazwy i usuwania).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Od listy zestawów do uruchomionego trybu użytkownik potrzebuje dokładnie 2 akcji
  (wybór zestawu, wybór kafelka).
- **SC-002**: Panel z kafelkami pojawia się w czasie poniżej 1 sekundy od wybrania zestawu na
  telefonie średniej klasy.
- **SC-003**: 100% kafelków oznaczonych „Wkrótce” lub nieaktywnych z powodu rozmiaru zestawu nie
  uruchamia żadnego trybu ani dotykiem, ani klawiaturą.
- **SC-004**: Po zakończeniu trybu użytkownik w 100% przypadków wraca na panel tego samego
  zestawu.
- **SC-005**: Cały panel (kafelki, lista słówek, akcje zestawu) jest obsługiwalny wyłącznie
  klawiaturą oraz wyłącznie dotykiem na ekranie 360 px, bez przewijania w poziomie.

## Assumptions

- Panel zastępuje obecną stronę szczegółów zestawu z funkcji 001 (lista słówek, zmiana nazwy,
  usuwanie) — kafelki trybów są na górze, zarządzanie zestawem niżej; nie powstaje osobny
  ekran.
- Tryby pojawiają się zawsze w kolejności z opisu użytkownika z wyjątkiem „Dopasowywania na
  czas” przesuniętego przed „Grammar Runner” — od najprostszego do najbardziej złożonego; nazwy
  „Italian Word Tower” i „Grammar Runner” pozostają po angielsku jako nazwy własne gier.
- Minimalne liczby słówek: Fiszki 1; Italian Word Tower 4; Dopasowywanie na czas 4; Grammar
  Runner 4 — do potwierdzenia w specyfikacjach tych trybów.
- „Grammar Runner” wymaga treści gramatycznych (zdań), których format CSV z samymi parami słówek
  jeszcze nie zawiera — jego zawartość zostanie określona w osobnej specyfikacji.
- Oznaczenie „Ostatnio” jest wygodą użytkownika — jego utrata (np. tryb prywatny) nie wpływa na
  dane nauki.
- Postęp słówek jest wspólny dla wszystkich trybów (konstytucja, zasada IV); panel pokazuje
  jeden wskaźnik „Opanowane”.
