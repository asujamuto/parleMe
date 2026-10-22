# Feature Specification: Dopasowywanie na czas

**Feature Branch**: `004-matching-game`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Utwórz feature „dopasowywanie na czas” w którym skopiujesz to co ma quilzet - fiszki pomieszane polsko - włoskie, trzeba znaleźć odpowiednik spośród zbioru kart"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Runda dopasowywania na czas (Priority: P1)

Uczący się otwiera panel zestawu i wybiera kafelek „Dopasowywanie na czas”. Widzi ekran startu
z krótką instrukcją i przyciskiem „Start”. Po starcie pojawia się plansza 12 wymieszanych
kafelków — 6 słówek włoskich i ich 6 polskich odpowiedników — a stoper zaczyna liczyć czas.
Użytkownik dotyka kafelka (zostaje zaznaczony), potem kafelka, który uważa za odpowiednik:
jeśli to para, oba kafelki znikają; jeśli nie, oba krótko sygnalizują błąd, zaznaczenie znika,
a do czasu doliczana jest 1 sekunda kary. Gdy znikną wszystkie pary, stoper się zatrzymuje i
pojawia się wynik: czas końcowy, liczba błędów, przyciski „Zagraj jeszcze raz” i „Wróć do
zestawu”.

**Why this priority**: To cała mechanika trybu — szybkie, nagradzające ćwiczenie rozpoznawania
znaczenia (konstytucja, zasada III), drugi działający tryb na panelu zestawu.

**Independent Test**: Na zestawie ITA5 (18 słówek) uruchomić tryb, dopasować wszystkie 6 par z
jednym błędem — plansza pustoszeje, wynik pokazuje czas z doliczoną 1 s i „Błędy: 1”.

**Acceptance Scenarios**:

1. **Given** panel zestawu z co najmniej 4 słówkami, **When** użytkownik wybiera „Dopasowywanie
   na czas”, **Then** widzi ekran startu z instrukcją i przyciskiem „Start”; stoper jeszcze nie
   liczy.
2. **Given** ekran startu, **When** użytkownik wybiera „Start”, **Then** pojawia się plansza
   12 kafelków (6 par) w losowej kolejności, włoskie i polskie wymieszane, a stoper liczy czas
   od 0 z dokładnością do 0,1 s.
3. **Given** brak zaznaczenia, **When** użytkownik wybiera kafelek, **Then** kafelek jest
   wyraźnie zaznaczony; ponowne wybranie tego samego kafelka zdejmuje zaznaczenie.
4. **Given** zaznaczony kafelek, **When** użytkownik wybiera jego odpowiednik, **Then** oba
   kafelki znikają z planszy (pozostałe nie zmieniają miejsc).
5. **Given** zaznaczony kafelek, **When** użytkownik wybiera kafelek niebędący odpowiednikiem,
   **Then** oba sygnalizują błąd (np. kolor i krótkie drgnięcie), zaznaczenie znika, do czasu
   doliczana jest 1 s, a licznik błędów rośnie o 1.
6. **Given** zaznaczony kafelek włoski, **When** użytkownik wybiera inny kafelek włoski, **Then**
   zaznaczenie przechodzi na nowy kafelek bez kary (dwa kafelki w tym samym języku nie tworzą
   próby dopasowania).
7. **Given** ostatnia para dopasowana, **Then** stoper się zatrzymuje i pojawia się wynik:
   czas końcowy (z karami), liczba błędów, lista par z błędami, „Zagraj jeszcze raz”
   (nowa plansza, nowe losowanie) i „Wróć do zestawu”.
8. **Given** trwająca runda, **When** użytkownik wybiera „Zakończ”, **Then** wraca na panel
   zestawu bez zapisywania wyniku.

---

### User Story 2 - Rekord zestawu (Priority: P2)

Po każdej ukończonej rundzie użytkownik widzi swój najlepszy czas dla tego zestawu. Jeśli
właśnie go pobił, wynik jest wyróżniony („Nowy rekord!”). Rekord jest widoczny również na
ekranie startu, żeby było z czym się ścigać.

**Why this priority**: Rywalizacja z własnym czasem jest głównym motorem powtarzania tego trybu
(„brainrot”, konstytucja III), ale sama runda działa bez niej.

**Independent Test**: Ukończyć 2 rundy na tym samym zestawie — po szybszej z nich widać „Nowy
rekord!”, a ekran startu trzeciej rundy pokazuje „Rekord: X s”; inny zestaw ma własny rekord.

**Acceptance Scenarios**:

1. **Given** zestaw bez rekordu, **When** użytkownik kończy rundę, **Then** wynik zostaje
   zapisany jako rekord i oznaczony „Nowy rekord!”.
2. **Given** rekord 20,0 s, **When** użytkownik kończy rundę w 25,3 s, **Then** wynik pokazuje
   25,3 s i „Rekord: 20,0 s” bez wyróżnienia.
3. **Given** rekord zestawu, **When** użytkownik otwiera ekran startu, **Then** widzi
   „Rekord: X s”; rekordy różnych zestawów są niezależne.
4. **Given** runda przerwana przez „Zakończ”, **Then** rekord się nie zmienia.

---

### User Story 3 - Wynik wpływa na postęp słówek (Priority: P3)

Słówka, przy których użytkownik pomylił się w dopasowywaniu, trafiają na początek kolejnej
sesji fiszek — tak samo jak słówka ocenione „Nie znam”. Rundy dopasowywania korzystają z tego
samego postępu: pary do planszy wybierane są tak, by częściej pojawiały się słówka trudne.

**Why this priority**: Konstytucja (zasada III) wymaga, by wynik rundy aktualizował wspólny
postęp słówek; tryb jest jednak grywalny także bez tego.

**Independent Test**: W rundzie pomylić się przy jednym słówku, potem otworzyć fiszki zestawu —
to słówko jest wśród pierwszych kart; liczba „Opanowane” nie rośnie od samego dopasowywania.

**Acceptance Scenarios**:

1. **Given** błędna próba z udziałem kafelka słówka A, **When** runda się kończy, **Then**
   słówko A ma w postępie ostatnią ocenę „Nie znam” (i traci ewentualny status opanowanego).
2. **Given** słówko dopasowane bez żadnego błędu, **Then** jego ostatnia ocena to „Znam”, ale
   seria sesji potrzebna do opanowania (funkcja 002) się nie zmienia.
3. **Given** zestaw z postępem, **When** startuje nowa runda, **Then** pary wybierane są
   najpierw spośród słówek ostatnio „Nie znam”, potem nigdy nie ćwiczonych, potem pozostałych.

---

### Edge Cases

- Zestaw z 4 lub 5 słówkami — plansza ma tyle par, ile słówek (8 lub 10 kafelków).
- Zestaw z mniej niż 4 słówkami — kafelek trybu na panelu jest nieaktywny („Wymaga co najmniej
  4 słówek”, funkcja 003).
- Dwie pary z identycznym tekstem po jednej stronie (np. „prego” i „per favore” → „proszę”) —
  w jednej rundzie nie pojawiają się dwie pary, których tekst włoski lub polski jest taki sam
  (po pominięciu wielkości liter i spacji), aby każdy kafelek miał dokładnie jeden odpowiednik.
- Zestaw, w którym nie da się wybrać 4 par bez powtórzeń tekstu — runda używa tylu par, ile się
  da (minimum 2); jeśli mniej niż 2, ekran startu wyjaśnia, że zestaw ma za mało różnych słówek.
- Długie teksty (całe zdania z plików ITA5) — tekst na kafelku zawija się i zmniejsza czcionkę;
  plansza mieści się na szerokości 360 px bez przewijania w poziomie.
- Szybkie wielokrotne dotknięcia — każdy kafelek reaguje tylko raz na próbę; w trakcie
  sygnalizacji błędu kolejne dotknięcia nie są liczone podwójnie.
- Przejście do innej karty przeglądarki / zablokowanie ekranu w trakcie rundy — stoper liczy
  dalej (czas rzeczywisty), wynik pozostaje uczciwy.
- `prefers-reduced-motion` — błąd sygnalizowany kolorem i tekstem, bez drgania; kafelki znikają
  bez animacji.
- Brak dostępu do pamięci przeglądarki — runda działa, rekord i postęp nie są zapamiętywane
  (jednorazowa informacja).

## Requirements *(mandatory)*

### Functional Requirements

**Start i plansza**

- **FR-001**: Kafelek „Dopasowywanie na czas” na panelu zestawu (funkcja 003) MUST być dostępny
  dla zestawów z co najmniej 4 słówkami i uruchamiać ten tryb dla danego zestawu.
- **FR-002**: Tryb MUST zaczynać od ekranu startu (nazwa zestawu, instrukcja w 1–2 zdaniach,
  rekord jeśli istnieje, przycisk „Start”); stoper rusza dopiero po „Start”.
- **FR-003**: Plansza MUST zawierać 6 par (12 kafelków), a gdy zestaw ma mniej słówek — tyle
  par, ile się da (min. 2); kolejność kafelków losowa, języki wymieszane.
- **FR-004**: W jednej rundzie MUST NOT wystąpić dwie pary o takim samym tekście włoskim albo
  polskim (porównanie bez wielkości liter i spacji na brzegach).

**Dopasowywanie**

- **FR-005**: Wybranie kafelka MUST go zaznaczać; ponowne wybranie zaznaczonego kafelka zdejmuje
  zaznaczenie; wybranie innego kafelka w tym samym języku przenosi zaznaczenie bez kary.
- **FR-006**: Wybranie przy zaznaczeniu kafelka w drugim języku MUST rozstrzygać próbę:
  odpowiednik → oba kafelki znikają; inny kafelek → sygnalizacja błędu, +1 s kary, licznik
  błędów +1, zaznaczenie znika.
- **FR-007**: Kafelki, które zniknęły, MUST NOT zmieniać układu pozostałych (puste miejsca
  zostają).
- **FR-008**: Stoper MUST pokazywać czas z dokładnością do 0,1 s (np. „12,3 s”), liczony w czasie
  rzeczywistym od „Start”, z doliczonymi karami.
- **FR-009**: Ekran rundy MUST mieć akcję „Zakończ” prowadzącą na panel zestawu bez zapisu
  wyniku.

**Wynik**

- **FR-010**: Po dopasowaniu ostatniej pary MUST pojawić się wynik: czas końcowy, liczba
  błędów, lista par, przy których wystąpił błąd, „Zagraj jeszcze raz” i „Wróć do zestawu”.
- **FR-011**: Wybór tego trybu MUST być zapamiętany jako ostatni tryb zestawu (oznaczenie
  „Ostatnio” na panelu, funkcja 003).

**Rekord (US2)**

- **FR-012**: System MUST zapamiętywać najlepszy czas ukończonej rundy dla każdego zestawu na
  urządzeniu i pokazywać go na ekranie startu i w wyniku; pobicie rekordu jest wyróżnione
  „Nowy rekord!”.
- **FR-013**: Rekord zestawu MUST być usuwany razem z zestawem.

**Postęp (US3)**

- **FR-014**: Po ukończeniu rundy każde słówko z planszy MUST zaktualizować postęp: słówko
  biorące udział w co najmniej jednej błędnej próbie → ocena „Nie znam” (jak pierwsza ocena w
  sesji fiszek: zeruje serię, odbiera opanowanie); słówko bez błędu → ocena „Znam” bez zmiany
  serii sesji (opanowanie zdobywa się wyłącznie w fiszkach).
- **FR-015**: Pary do planszy MUST być wybierane według kolejności priorytetów postępu
  (funkcja 002): ostatnio „Nie znam” → nigdy nie ćwiczone → pozostałe nieopanowane → opanowane,
  z losowaniem w obrębie grup.

**Interfejs**

- **FR-016**: Kafelki MUST mieć cele dotyku ≥ 44 px, być obsługiwalne klawiaturą (Tab,
  Enter/Spacja), mieć stan zaznaczenia odczytywany przez czytniki ekranu, a tekst włoski
  oznaczony jako język włoski; dopasowanie i błąd ogłaszane komunikatem dla czytnika ekranu.
- **FR-017**: Przy `prefers-reduced-motion` MUST NOT być animacji drgania ani znikania.
- **FR-018**: Tryb MUST działać offline po pierwszym załadowaniu aplikacji.

### Key Entities

- **Runda dopasowywania**: nietrwała — wybrane pary, układ kafelków, zaznaczenie, dopasowane
  pary, licznik błędów, kary, czas startu i końca, słówka z błędami.
- **Kafelek**: jedna strona pary (tekst włoski albo polski), identyfikator słówka, język,
  pozycja na planszy, stan (widoczny / zaznaczony / błąd / dopasowany).
- **Rekord zestawu**: trwały — identyfikator zestawu, najlepszy czas, data uzyskania.
- **Postęp słówka**: z funkcji 002 — aktualizowany wynikiem rundy (FR-014).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Od panelu zestawu do pierwszego dotknięcia kafelka użytkownik potrzebuje 2 akcji
  (kafelek trybu, „Start”), a plansza pojawia się w czasie poniżej 1 sekundy.
- **SC-002**: Runda 6 par bez błędów jest możliwa do ukończenia w poniżej 30 sekund przez
  osobę znającą słówka (cel: krótkie, powtarzalne rundy).
- **SC-003**: W teście z 1 błędną próbą wynik pokazuje „Błędy: 1”, a czas końcowy jest o
  dokładnie 1,0 s większy od czasu zmierzonego przez stoper.
- **SC-004**: W 100% rund każdy kafelek ma dokładnie jeden odpowiednik na planszy (brak
  dwuznacznych par).
- **SC-005**: Plansza 12 kafelków z najdłuższymi pozycjami z plików ITA5 mieści się na ekranie
  360 px bez przewijania w poziomie, a całą rundę da się przejść wyłącznie klawiaturą.
- **SC-006**: Po rundzie z błędem przy słówku A, słówko A jest wśród pierwszych kart następnej
  sesji fiszek (w 100% prób).

## Assumptions

- Mechanika wzorowana na trybie „Dopasuj” w Quizlet: 6 par, kara 1 s za błąd, stoper rosnący,
  rekord zestawu — bez elementów specyficznych dla Quizleta (konta, rankingi online).
- Minimalny rozmiar zestawu dla tego trybu: 4 słówka (zgodnie z założeniem funkcji 003).
- Warianty tłumaczeń (`A / B`) i całe zdania są pokazywane na kafelku w całości.
- Dopasowywanie ćwiczy rozpoznawanie, więc nie może samo nadawać statusu „opanowane” — może go
  jedynie odebrać przy błędzie (FR-014).
- Rekordy są przechowywane tylko na urządzeniu (konstytucja II); brak historii wszystkich rund.
- Dźwięki i efekty nagród poza zakresem.
