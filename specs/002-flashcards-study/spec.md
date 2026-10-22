# Feature Specification: Tryb fiszek na zaimportowanych zestawach

**Feature Branch**: `002-flashcards-study`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Tryb fiszek: nauka na zaimportowanych zestawach słówek. Użytkownik wybiera zestaw z listy, przegląda fiszki (włoski ↔ polski, odwracanie kartą), ocenia czy znał słówko; zastępuje obecne demo lekcji (/[slug]) opartym na initialCards."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sesja fiszek na wybranym zestawie (Priority: P1)

Uczący się ma zaimportowany zestaw (funkcja 001). Na liście zestawów wybiera „Fiszki” przy
zestawie i od razu widzi pierwszą kartę ze słowem włoskim. Dotyka karty (lub naciska klawisz),
karta się odwraca i pokazuje tłumaczenie polskie. Ocenia się: „Znam” albo „Nie znam”. Po
ocenie od razu pojawia się następna karta. Karty oznaczone „Nie znam” wracają pod koniec tej
samej sesji. Na końcu widzi podsumowanie: ile słówek znał od razu, ile powtarzał, i może zacząć
kolejną rundę albo wrócić do listy.

**Why this priority**: To pierwszy tryb nauki, który korzysta z własnych słówek użytkownika —
bez niego import zestawów nie daje jeszcze żadnej wartości edukacyjnej. Zastępuje demo oparte
na kartach wpisanych na sztywno.

**Independent Test**: Zaimportować plik ITA5 (18 par), wybrać „Fiszki”, przejść całą rundę
oznaczając 3 karty jako „Nie znam” — te 3 karty pojawiają się ponownie przed podsumowaniem, a
podsumowanie pokazuje 15 znanych od razu i 3 powtórzone.

**Acceptance Scenarios**:

1. **Given** zestaw z 18 słówkami, **When** użytkownik wybiera „Fiszki” przy tym zestawie,
   **Then** widzi pierwszą kartę ze słowem włoskim oraz postęp rundy „Znane: 0 / 18” z paskiem.
2. **Given** karta stroną włoską do góry, **When** użytkownik dotyka karty lub naciska
   spację, **Then** karta odwraca się i pokazuje tłumaczenie polskie; przyciski oceny stają się
   dostępne dopiero po odwróceniu.
3. **Given** odwrócona karta, **When** użytkownik wybiera „Znam”, **Then** pojawia się następna
   karta stroną włoską do góry.
4. **Given** odwrócona karta, **When** użytkownik wybiera „Nie znam”, **Then** pojawia się
   następna karta, a oceniona karta wraca w tej rundzie po kartach jeszcze niepokazanych.
5. **Given** karta wróciła jako powtórka i użytkownik znów wybiera „Nie znam”, **Then** wraca
   ponownie; runda kończy się dopiero, gdy każda karta zostanie oceniona „Znam” albo użytkownik
   zakończy sesję.
6. **Given** wszystkie karty ocenione „Znam”, **When** runda się kończy, **Then** użytkownik widzi
   podsumowanie (znane od razu, powtórzone, czas rundy) i akcje „Jeszcze raz” oraz „Wróć do
   zestawów”.
7. **Given** trwająca sesja, **When** użytkownik wybiera „Zakończ”, **Then** wraca do listy
   zestawów; już udzielone oceny nie przepadają (patrz US2).
8. **Given** zestaw, który nie istnieje (np. usunięty, nieaktualny link), **When** użytkownik
   otwiera jego fiszki, **Then** widzi komunikat „Nie znaleziono zestawu” i link do listy.

---

### User Story 2 - Postęp słówek i powtarzanie trudnych (Priority: P2)

Uczący się wraca następnego dnia do tego samego zestawu. Słówka, których nie znał ostatnio,
pojawiają się na początku sesji, a te, które zna, rzadziej. Na liście zestawów widzi, ile słówek
z zestawu już opanował.

**Why this priority**: Zgodnie z konstytucją (zasada III) wynik rundy musi aktualizować wspólny
postęp słówek, aby trudne słowa wracały częściej. Bez tego każda sesja zaczyna się od zera —
fiszki działają, ale nauka jest mniej skuteczna.

**Independent Test**: Przejść sesję oznaczając 3 słówka „Nie znam”, zamknąć aplikację, wrócić i
uruchomić fiszki tego zestawu — pierwsze 3 karty to te słówka; lista zestawów pokazuje
„Opanowane: 15 / 18”.

**Acceptance Scenarios**:

1. **Given** sesja, w której słówko oceniono „Nie znam”, **When** użytkownik zaczyna nową sesję
   tego zestawu (także po ponownym otwarciu aplikacji), **Then** to słówko jest wśród pierwszych
   kart.
2. **Given** słówko ocenione „Znam” przy pierwszym pokazaniu w 2 kolejnych sesjach, **Then**
   uznaje się je za opanowane i trafia na koniec kolejki w kolejnych sesjach.
3. **Given** opanowane słówko oceniono „Nie znam”, **Then** przestaje być opanowane i wraca na
   początek kolejki w następnej sesji.
4. **Given** zestaw z postępem, **When** użytkownik otwiera listę zestawów, **Then** przy zestawie
   widzi „Opanowane: X / N”.
5. **Given** ocena została udzielona, **When** użytkownik zamknie aplikację w trakcie sesji,
   **Then** ta ocena jest zapamiętana.

---

### User Story 3 - Kierunek nauki polski → włoski (Priority: P3)

Uczący się, który rozpoznaje już słowa włoskie, chce ćwiczyć przypominanie. Przed rozpoczęciem
lub w trakcie sesji przełącza kierunek: na przedniej stronie karty jest słowo polskie, a po
odwróceniu włoskie.

**Why this priority**: Przypominanie (PL → IT) jest trudniejsze i skuteczniejsze niż
rozpoznawanie, ale podstawowa sesja działa bez tej opcji.

**Independent Test**: Włączyć kierunek „polski → włoski”, rozpocząć sesję — przód karty pokazuje
tekst polski, tył włoski; ustawienie jest zapamiętane przy kolejnej sesji.

**Acceptance Scenarios**:

1. **Given** ekran fiszek, **When** użytkownik wybiera kierunek „polski → włoski”, **Then**
   bieżąca i kolejne karty pokazują z przodu tekst polski, a po odwróceniu włoski.
2. **Given** wybrany kierunek, **When** użytkownik uruchamia fiszki ponownie (dowolny zestaw),
   **Then** kierunek jest zachowany.

---

### Edge Cases

- Zestaw z 1 słówkiem — sesja działa, postęp „Znane: 0 / 1”, po „Znam” od razu podsumowanie.
- Zestaw z bardzo dużą liczbą słówek (np. 2000) — runda obejmuje najwyżej 20 kart dobranych wg
  priorytetu (US2), aby zmieściła się w ok. 3 minutach; użytkownik widzi „Runda: 20 z 2000
  słówek”.
- Długie teksty (całe zdania) i warianty tłumaczenia (`Co bierzesz? / Co zamawiasz?`) —
  wyświetlane w całości, bez przewijania w poziomie na ekranie 360 px; dłuższy tekst może mieć
  mniejszą czcionkę.
- Szybkie wielokrotne dotknięcia — jedna ocena na kartę; podwójne dotknięcie nie pomija karty.
- Użytkownik odświeża stronę w trakcie sesji — wraca na początek nowej rundy tego zestawu;
  oceny już udzielone są zachowane (US2).
- Brak możliwości zapisu postępu (np. tryb prywatny przeglądarki) — sesja działa dalej, a
  użytkownik widzi jednorazową informację, że postęp nie zostanie zapamiętany.
- Ograniczenie ruchu w systemie (`prefers-reduced-motion`) — karta zmienia stronę bez animacji
  obrotu.
- Stare adresy demo lekcji (np. `/1`) — prowadzą do listy zestawów zamiast do nieistniejącego
  demo.

## Requirements *(mandatory)*

### Functional Requirements

**Wejście do trybu**

- **FR-001**: Każdy zestaw na liście zestawów MUST mieć akcję „Fiszki” uruchamiającą sesję tego
  zestawu.
- **FR-002**: Sesja fiszek MUST mieć własny adres powiązany z zestawem, aby dało się do niej
  wrócić z historii przeglądarki; nieistniejący zestaw → komunikat „Nie znaleziono zestawu” z
  linkiem do listy.

**Karta i ocena**

- **FR-003**: Karta MUST pokazywać najpierw jedną stronę (domyślnie tekst włoski), a po
  odwróceniu drugą (tekst polski); odwrócenie dotykiem karty, klawiszem spacji lub Enter.
- **FR-004**: Po odwróceniu użytkownik MUST móc ocenić kartę jako „Znam” lub „Nie znam”
  (przyciski oraz klawisze: strzałka w prawo / `1` = Znam, strzałka w lewo / `2` = Nie znam).
  Przed odwróceniem ocena nie jest możliwa.
- **FR-005**: Każda karta przyjmuje dokładnie jedną ocenę na pokazanie; po ocenie automatycznie
  pojawia się następna.
- **FR-006**: Karta oceniona „Nie znam” MUST wrócić w tej samej rundzie po wszystkich kartach
  jeszcze niepokazanych; runda kończy się, gdy wszystkie karty zostały ocenione „Znam”.
- **FR-007**: Ekran sesji MUST pokazywać postęp rundy „Znane: X / N” (X = karty ocenione „Znam”,
  N = karty w rundzie) z paskiem postępu oraz akcję „Zakończ”.
- **FR-008**: Tekst włoski MUST być oznaczony jako język włoski (dla czytników ekranu i
  wymowy), a cała karta czytelna przez czytnik ekranu po odwróceniu.

**Runda i podsumowanie**

- **FR-009**: Runda MUST obejmować wszystkie słówka zestawu, jeśli jest ich najwyżej 20; w
  większych zestawach 20 słówek wybranych wg priorytetu z FR-012.
- **FR-010**: Po zakończeniu rundy system MUST pokazać podsumowanie: liczbę słówek znanych przy
  pierwszym pokazaniu, liczbę powtórzonych, czas rundy, listę słówek powtórzonych, oraz akcje
  „Jeszcze raz” (nowa runda tego zestawu) i „Wróć do zestawów”.

**Postęp (US2)**

- **FR-011**: Każda ocena MUST być zapisywana od razu na urządzeniu jako postęp danego słówka
  (powiązany ze stałym identyfikatorem słówka z funkcji 001).
- **FR-012**: Kolejność kart w nowej rundzie: najpierw słówka ostatnio ocenione „Nie znam”, potem
  słówka nigdy nie pokazane (w kolejności z pliku), potem pozostałe nieopanowane, na końcu
  opanowane; w obrębie grupy kolejność losowa, z wyjątkiem słówek nigdy nie pokazanych.
- **FR-013**: Słówko jest „opanowane”, gdy w 2 kolejnych sesjach zostało ocenione „Znam” przy
  pierwszym pokazaniu w danej sesji; ocena „Nie znam” odbiera status opanowania.
- **FR-014**: Lista zestawów MUST pokazywać przy każdym zestawie liczbę opanowanych słówek
  („Opanowane: X / N”).
- **FR-015**: Usunięcie zestawu (funkcja 001, US2) MUST usuwać też postęp jego słówek.

**Kierunek (US3)**

- **FR-016**: Użytkownik MUST móc przełączyć kierunek „włoski → polski” / „polski → włoski”;
  wybór jest zapamiętany między sesjami i wspólny dla wszystkich zestawów.

**Zastąpienie demo**

- **FR-017**: Demo lekcji oparte na kartach wpisanych w kodzie MUST zostać usunięte; tryb fiszek
  korzysta wyłącznie ze słówek z zaimportowanych zestawów (konstytucja, zasada I).
- **FR-018**: Adresy dawnego demo lekcji MUST przekierowywać do listy zestawów.

**Interfejs**

- **FR-019**: Ekran sesji MUST być w pełni obsługiwalny dotykiem na ekranie od 360 px (cele
  dotyku ≥ 44 px) i samą klawiaturą; przy `prefers-reduced-motion` karta zmienia stronę bez
  animacji. Teksty interfejsu po polsku.
- **FR-020**: Tryb fiszek MUST działać offline (po pierwszym załadowaniu aplikacji).

### Key Entities

- **Sesja fiszek**: jedno uruchomienie trybu dla zestawu; nietrwała. Zawiera kolejkę kart
  rundy, wybrany kierunek, czas rozpoczęcia, oceny udzielone w sesji.
- **Postęp słówka**: trwały stan nauki jednego słówka. Atrybuty: identyfikator słówka (z funkcji
  001), identyfikator zestawu, ostatnia ocena, data ostatniej oceny, liczba kolejnych sesji ze
  „Znam” przy pierwszym pokazaniu, czy opanowane, liczba wszystkich ocen „Znam” / „Nie znam”.
- **Preferencje nauki**: trwałe ustawienia użytkownika; w tej funkcji: kierunek fiszek.
- **Zestaw / Słówko**: z funkcji 001 — tryb fiszek ich nie modyfikuje.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Od listy zestawów do pierwszej karty na ekranie użytkownik potrzebuje jednej
  akcji, a karta pojawia się w czasie poniżej 1 sekundy.
- **SC-002**: Runda 20 kart, w której użytkownik zna wszystkie słówka, zajmuje poniżej 3 minut
  (ok. 5–8 s na kartę: odwrócenie + ocena).
- **SC-003**: W teście z 18 kartami i 3 ocenami „Nie znam” 100% ocenionych „Nie znam” kart wraca
  w tej samej rundzie, a podsumowanie pokazuje 15 / 3.
- **SC-004**: Po ponownym otwarciu aplikacji (także offline) 100% udzielonych ocen jest
  zachowanych, a słówka ocenione ostatnio „Nie znam” są pierwszymi kartami nowej sesji.
- **SC-005**: Całą sesję (odwrócenie, oceny, zakończenie, podsumowanie) da się przejść wyłącznie
  klawiaturą oraz wyłącznie dotykiem na ekranie 360 px, bez przewijania w poziomie.
- **SC-006**: W aplikacji nie pozostaje żadna karta ani lekcja wpisana na sztywno — wszystkie
  fiszki pochodzą z zestawów użytkownika.

## Assumptions

- Funkcja 001 (P1: import i lista zestawów) jest dostępna; tryb fiszek korzysta z jej zestawów,
  słówek i stałych identyfikatorów słówek. Podgląd listy słówek zestawu i jego edycja pozostają
  w funkcji 001 (US2–US3).
- Ocena jest dwustopniowa („Znam” / „Nie znam”), zgodnie z opisem funkcji; obecna w demo skala
  1–5 zostaje porzucona jako zbyt wolna dla krótkich, dynamicznych rund (konstytucja, zasada III).
- Rozmiar rundy to 20 kart — tyle mieści się w limicie ok. 3 minut na rundę z konstytucji;
  zmiana rozmiaru przez użytkownika nie jest częścią tej funkcji.
- Prosty model powtórek (FR-012, FR-013) wystarcza na start; zaawansowany algorytm powtórek
  rozłożonych w czasie może zastąpić go później bez zmiany interfejsu.
- Warianty tłumaczenia (`A / B`) są pokazywane jako jeden tekst — w fiszkach użytkownik sam
  ocenia, czy znał słówko, więc nie trzeba ich rozdzielać.
- Postęp jest przechowywany tylko na urządzeniu (konstytucja, zasada II); brak kont i
  synchronizacji.
- Dźwięk (wymowa, efekty) i animacje nagród są poza zakresem tej funkcji.
- Tryb mieszany (losowy kierunek dla każdej karty) jest poza zakresem.
