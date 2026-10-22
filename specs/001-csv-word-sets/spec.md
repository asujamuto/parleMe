# Feature Specification: Import CSV i zarządzanie zestawami słówek

**Feature Branch**: `001-csv-word-sets`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Import CSV i zarządzanie zestawami słówek. Warto zacząć od tego, bo na tym opierają się wszystkie tryby"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import zestawu słówek z pliku CSV (Priority: P1)

Uczący się ma plik CSV z parami słówek (kolumny `italian`, `polish`), np. przygotowany przez
lektora po zajęciach. Otwiera aplikację na telefonie, wybiera plik, nadaje zestawowi nazwę,
widzi podgląd wczytanych par i liczbę pominiętych wierszy, po czym zapisuje zestaw. Zestaw
jest od razu dostępny na liście i gotowy do użycia w trybach nauki.

**Why this priority**: Bez zestawów słówek żaden tryb nauki (fiszki, gry, zadania) nie ma
treści. To fundament całej aplikacji i samodzielnie stanowi wartość: użytkownik ma swoje
słówka w aplikacji, na telefonie, bez konta.

**Independent Test**: Zaimportować przykładowy plik CSV, zamknąć i ponownie otworzyć aplikację
(także bez internetu) — zestaw z poprawną liczbą par jest widoczny na liście.

**Acceptance Scenarios**:

1. **Given** brak zestawów, **When** użytkownik wybiera poprawny plik CSV z 20 parami i
   zatwierdza nazwę „ITA5 – Codzienne zwroty”, **Then** na liście pojawia się zestaw o tej
   nazwie z licznikiem „20 słówek”.
2. **Given** wybrany plik, **When** wyświetla się podgląd, **Then** użytkownik widzi
   wczytane pary (włoski – polski), liczbę poprawnych wierszy i listę pominiętych wierszy z
   numerem wiersza i przyczyną po polsku.
3. **Given** plik bez kolumny `polish`, **When** użytkownik go wybiera, **Then** import jest
   zablokowany, a komunikat wyjaśnia, jakich kolumn oczekujemy i pokazuje przykład.
4. **Given** podgląd importu, **When** użytkownik anuluje, **Then** żaden zestaw nie zostaje
   zapisany.
5. **Given** zaimportowany zestaw, **When** aplikacja zostaje otwarta ponownie bez dostępu
   do sieci, **Then** zestaw i jego słówka są dostępne.

---

### User Story 2 - Przeglądanie i zarządzanie zestawami (Priority: P2)

Uczący się widzi listę swoich zestawów (nazwa, liczba słówek, data dodania), może otworzyć
zestaw i przejrzeć jego słówka, zmienić nazwę zestawu, usunąć go (z potwierdzeniem) oraz
wybrać zestaw jako źródło dla trybu nauki.

**Why this priority**: Gdy zestawów jest kilka (np. jeden na lekcję), użytkownik musi umieć
je odnaleźć, uporządkować i wskazać, czego chce się uczyć. Bez tego import działa, ale
aplikacja szybko staje się nieczytelna.

**Independent Test**: Zaimportować 3 zestawy, zmienić nazwę jednego, usunąć drugi, otworzyć
trzeci i sprawdzić listę jego słówek — stan utrzymuje się po ponownym otwarciu aplikacji.

**Acceptance Scenarios**:

1. **Given** 3 zestawy, **When** użytkownik otwiera ekran zestawów, **Then** widzi wszystkie
   3 z nazwą, liczbą słówek i datą dodania, od najnowszego.
2. **Given** zestaw, **When** użytkownik zmienia jego nazwę na pustą, **Then** zmiana jest
   odrzucona z komunikatem; **When** na niepustą, **Then** nowa nazwa jest widoczna wszędzie.
3. **Given** zestaw, **When** użytkownik wybiera „Usuń” i potwierdza, **Then** zestaw znika
   wraz z jego słówkami; **When** anuluje potwierdzenie, **Then** nic się nie zmienia.
4. **Given** zestaw, **When** użytkownik wybiera go jako źródło nauki, **Then** tryby nauki
   otrzymują słówka tylko z tego zestawu.

---

### User Story 3 - Edycja słówek w zestawie (Priority: P3)

Uczący się zauważa literówkę albo chce dopisać brakujące słowo. W widoku zestawu może
poprawić parę, dodać nową parę ręcznie i usunąć zbędną — bez ponownego importu pliku.

**Why this priority**: Poprawki są częste, ale można je obejść, poprawiając plik i importując
go ponownie (US4), więc to wygoda, nie warunek działania.

**Independent Test**: W istniejącym zestawie poprawić jedną parę, dodać jedną i usunąć jedną
— licznik i lista słówek odpowiadają zmianom po ponownym otwarciu aplikacji.

**Acceptance Scenarios**:

1. **Given** zestaw, **When** użytkownik edytuje polskie tłumaczenie pary i zapisuje,
   **Then** nowe tłumaczenie jest widoczne w zestawie i w trybach nauki.
2. **Given** zestaw, **When** użytkownik dodaje parę z pustym polem, **Then** zapis jest
   zablokowany z komunikatem o wymaganym polu.
3. **Given** zestaw, **When** użytkownik usuwa parę, **Then** licznik słówek maleje o 1.

---

### User Story 4 - Aktualizacja zestawu nowszą wersją pliku (Priority: P3)

Lektor wysłał poprawioną wersję pliku z kilkoma nowymi słowami. Uczący się importuje ją do
istniejącego zestawu: nowe pary są dodawane, powtórzone pomijane, a postęp nauki
istniejących słówek zostaje zachowany.

**Why this priority**: Zachowanie postępu przy aktualizacji ma znaczenie dopiero, gdy istnieją
tryby nauki zapisujące postęp; do tego czasu wystarczy import nowego zestawu.

**Independent Test**: Zaimportować plik z 10 parami, następnie do tego samego zestawu plik z
12 parami (10 tych samych + 2 nowe) — zestaw ma 12 par, podsumowanie mówi „dodano 2,
pominięto 10 powtórzeń”.

**Acceptance Scenarios**:

1. **Given** zestaw z 10 parami, **When** użytkownik importuje do niego plik z 10
   identycznymi i 2 nowymi parami, **Then** zestaw ma 12 par, a podsumowanie pokazuje
   „dodano 2, pominięto 10”.
2. **Given** słówko z zapisanym postępem nauki, **When** ten sam wpis pojawia się w nowym
   pliku, **Then** postęp tego słówka pozostaje bez zmian.

---

### User Story 5 - Zestaw przykładowy na start (Priority: P3)

Nowy użytkownik bez własnego pliku może jednym dotknięciem dodać zestaw przykładowy
(słówka z kursu ITA5 dołączone do aplikacji) i od razu wypróbować tryby nauki. Może też
pobrać przykładowy plik CSV jako wzór formatu.

**Why this priority**: Obniża barierę wejścia, ale nie jest konieczne dla użytkownika, który
ma już własny plik.

**Independent Test**: Na pustej aplikacji wybrać „Dodaj zestaw przykładowy” — pojawia się
zestaw z niepustą listą słówek; „Pobierz wzór CSV” zapisuje plik, który daje się
zaimportować bez błędów.

**Acceptance Scenarios**:

1. **Given** brak zestawów, **When** użytkownik otwiera aplikację, **Then** widzi zachętę z
   dwiema akcjami: „Importuj CSV” i „Dodaj zestaw przykładowy”.
2. **Given** pobrany wzór CSV, **When** użytkownik go importuje, **Then** import kończy się
   bez pominiętych wierszy.

---

### Edge Cases

- Plik z BOM na początku, ze średnikiem zamiast przecinka jako separatorem albo z nagłówkami
  z dodatkowymi spacjami / inną wielkością liter (`Italian `) — import działa.
- Wartości w cudzysłowach zawierające przecinki (np. `"Sì, certo"`) są wczytane w całości.
- Wiersze puste lub z jedną pustą kolumną — pominięte i wymienione w podglądzie z numerem
  wiersza i przyczyną.
- Dodatkowe kolumny w pliku — ignorowane w tej funkcji, bez blokowania importu.
- Powtórzone pary w jednym pliku (ta sama para po pominięciu wielkości liter i białych
  znaków) — zachowana jedna, reszta wymieniona jako powtórzenia.
- Ten sam wyraz włoski z różnymi tłumaczeniami — traktowany jako dwie różne pary.
- Tłumaczenia z wariantami (np. `Co bierzesz? / Co zamawiasz?`), całe zdania, polskie
  znaki diakrytyczne i typograficzne apostrofy (`L’ultimo`) — zachowane bez zmian.
- Plik, który nie jest CSV, jest pusty, ma tylko nagłówek lub nie ma żadnego poprawnego
  wiersza — import zablokowany z czytelnym komunikatem.
- Plik większy niż 1 MB lub z więcej niż 2000 wierszy — import zablokowany z komunikatem o
  limicie.
- Nazwa zestawu już istnieje — zapis dozwolony, ale użytkownik widzi ostrzeżenie i
  propozycję nazwy z dopiskiem „(2)”.
- Brak miejsca w pamięci przeglądarki lub odmowa zapisu (np. tryb prywatny) — użytkownik
  dostaje komunikat, a dane z podglądu nie przepadają do czasu zamknięcia ekranu.
- Usunięcie zestawu wybranego jako źródło nauki — wybór źródła zostaje wyczyszczony.

## Requirements *(mandatory)*

### Functional Requirements

**Import**

- **FR-001**: Użytkownik MUST móc wybrać plik CSV z urządzenia (telefon i komputer) i
  zaimportować go jako nowy zestaw słówek.
- **FR-002**: System MUST rozpoznawać kolumny `italian` i `polish` niezależnie od wielkości
  liter, otaczających spacji i kolejności kolumn; MUST obsługiwać kodowanie UTF-8 (z BOM i bez)
  oraz separator przecinek lub średnik.
- **FR-003**: System MUST przed zapisem pokazać podgląd: liczbę poprawnych par, listę par oraz
  listę pominiętych wierszy z numerem wiersza i przyczyną w języku polskim.
- **FR-004**: System MUST przycinać białe znaki na początku i końcu wartości i pomijać wiersze,
  w których którakolwiek z wymaganych kolumn jest pusta.
- **FR-005**: System MUST zablokować import, gdy brakuje wymaganych kolumn, plik jest pusty, nie
  zawiera żadnego poprawnego wiersza albo przekracza limit (1 MB lub 2000 wierszy), i wyświetlić
  komunikat z opisem oczekiwanego formatu.
- **FR-006**: System MUST w obrębie zestawu usuwać powtórzenia par (porównanie bez rozróżniania
  wielkości liter i białych znaków na brzegach) i informować o liczbie pominiętych powtórzeń.
- **FR-007**: Użytkownik MUST nadać zestawowi nazwę (1–60 znaków); domyślnie proponowana jest
  nazwa pliku bez rozszerzenia.
- **FR-008**: Anulowanie podglądu MUST NOT zapisywać żadnych danych.

**Zarządzanie zestawami**

- **FR-009**: System MUST wyświetlać listę zestawów z nazwą, liczbą słówek i datą dodania,
  posortowaną od najnowszego.
- **FR-010**: Użytkownik MUST móc otworzyć zestaw i przejrzeć wszystkie jego pary.
- **FR-011**: Użytkownik MUST móc zmienić nazwę zestawu (te same reguły co FR-007).
- **FR-012**: Użytkownik MUST móc usunąć zestaw po potwierdzeniu; usunięcie obejmuje słówka i
  postęp nauki tego zestawu.
- **FR-013**: Użytkownik MUST móc wybrać zestaw jako źródło słówek dla trybów nauki; wybór
  MUST być zapamiętany między wizytami.
- **FR-014**: Użytkownik MUST móc dodać, edytować i usunąć pojedynczą parę w zestawie; obie
  strony pary są wymagane.
- **FR-015**: Użytkownik MUST móc zaimportować plik do istniejącego zestawu: nowe pary są
  dodawane, powtórzenia pomijane, a postęp istniejących słówek zachowany.
- **FR-016**: Użytkownik MUST móc wyeksportować zestaw do pliku CSV w tym samym formacie
  (`italian,polish`), który daje się ponownie zaimportować bez strat.

**Dane i prywatność**

- **FR-017**: Zestawy, słówka i wybór źródła MUST być przechowywane wyłącznie na urządzeniu
  użytkownika i dostępne bez konta i bez połączenia z siecią.
- **FR-018**: Zawartość pliku MUST NOT być wysyłana poza urządzenie.
- **FR-019**: Użytkownik MUST móc usunąć wszystkie swoje dane jednym działaniem (z
  potwierdzeniem).
- **FR-020**: Każde słówko MUST mieć stały identyfikator niezmieniony przy edycji, zmianie nazwy
  zestawu ani ponownym imporcie, aby przyszłe tryby mogły przypisywać do niego postęp.

**Start**

- **FR-021**: Przy braku zestawów system MUST pokazać ekran startowy z akcjami „Importuj CSV”
  i „Dodaj zestaw przykładowy”.
- **FR-022**: System MUST udostępniać zestaw przykładowy oparty na dołączonych plikach ITA5
  oraz wzór pliku CSV do pobrania.

**Interfejs**

- **FR-023**: Wszystkie ekrany tej funkcji MUST być w pełni obsługiwalne dotykiem na ekranie o
  szerokości 360 px oraz samą klawiaturą; teksty interfejsu i komunikaty są po polsku.

### Key Entities

- **Zestaw słówek**: nazwana kolekcja par do nauki. Atrybuty: identyfikator, nazwa, data
  utworzenia, data ostatniej zmiany, liczba słówek, źródło (import pliku, przykładowy, ręczny).
- **Słówko (para)**: jednostka nauki należąca do dokładnie jednego zestawu. Atrybuty:
  identyfikator (stały), tekst włoski, tekst polski (może zawierać warianty), pozycja w
  zestawie. Postęp nauki będzie do niego przypisywany przez przyszłe tryby.
- **Raport importu**: wynik analizy pliku przed zapisem — liczba poprawnych par, lista
  pominiętych wierszy (numer, przyczyna), liczba powtórzeń. Nie jest trwale przechowywany.
- **Wybór źródła nauki**: zapamiętany zestaw, z którego tryby nauki pobierają słówka.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nowy użytkownik importuje swój pierwszy plik i widzi zestaw na liście w czasie
  poniżej 60 sekund od otwarcia aplikacji na telefonie.
- **SC-002**: Wszystkie 4 dołączone pliki ITA5 importują się bez żadnego pominiętego wiersza i
  bez zmiany treści (porównanie znak po znaku z plikiem źródłowym).
- **SC-003**: Podgląd pliku z 2000 wierszami pojawia się w czasie poniżej 2 sekund na średniej
  klasy telefonie.
- **SC-004**: 100% błędnych wierszy w pliku testowym jest wymienionych w podglądzie z poprawnym
  numerem wiersza i przyczyną.
- **SC-005**: Zestaw wyeksportowany i ponownie zaimportowany zawiera identyczne pary (0
  różnic).
- **SC-006**: Po zamknięciu i ponownym otwarciu aplikacji w trybie offline 100% zapisanych
  zestawów i słówek jest dostępnych.
- **SC-007**: Każdą akcję z User Story 1–3 da się wykonać wyłącznie klawiaturą oraz wyłącznie
  dotykiem na ekranie 360 px bez przewijania w poziomie.

## Assumptions

- Aplikacja ma jednego użytkownika na urządzeniu; brak kont i synchronizacji między
  urządzeniami (zgodnie z zasadą local-first). Dane z różnych przeglądarek/urządzeń są osobne.
- Zestawy tworzą płaską listę (bez folderów, lekcji ani kategorii). Grupowanie można dodać
  później, jeśli liczba zestawów będzie tego wymagać; obecny podział na lekcje i rozdziały w
  kodzie zostanie zastąpiony zestawami.
- Wpis może być pojedynczym słowem, frazą lub całym zdaniem; warianty tłumaczenia (np. oddzielone
  ` / `) są przechowywane jako jeden tekst. Ich rozdzielanie na alternatywne poprawne
  odpowiedzi to decyzja przyszłych trybów nauki.
- Dodatkowe kolumny CSV (np. przykładowe zdanie) są ignorowane w tej funkcji; ich obsługa
  zostanie zdefiniowana razem z trybem „wybór słowa w zdaniu”.
- Limit 2000 wierszy / 1 MB na plik wystarcza dla typowej listy słówek z lekcji (przykładowe
  pliki mają 3–21 par).
- Zestaw przykładowy powstaje z 4 plików z katalogu przykładów ITA5 jako jeden zestaw lub 4
  osobne zestawy — decyzja wizualna na etapie planu, bez wpływu na wymagania.
- Postęp nauki i algorytm powtórek nie są częścią tej funkcji; ta funkcja zapewnia tylko stałe
  identyfikatory słówek (FR-020) i zachowanie postępu przy aktualizacji (FR-015).
- Istniejąca integracja z backendem w chmurze nie jest używana przez tę funkcję.
