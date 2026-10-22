# Quickstart: walidacja P1 (sesja fiszek)

## Kontrole automatyczne

```sh
npm run lint
npm test        # m.in. tests/unit/flashcards/session.test.ts
npm run build
```

## Scenariusz ręczny (`npm run dev`, emulacja 360 px, potem sama klawiatura)

1. Zaimportuj `app/data/2ita1/ITA5(Zwierzęta i porównania (idiomy)).csv` (18 słówek).
2. Na liście przy zestawie wybierz „Fiszki” → pierwsza karta ze słowem włoskim, „Znane: 0 / 18”.
3. Dotknij karty (lub spacja) → tłumaczenie polskie, pojawiają się „Znam” / „Nie znam”.
4. Oceń 3 karty „Nie znam”, resztę „Znam” (klawiatura: → / `1` = Znam, ← / `2` = Nie znam) →
   3 karty wracają przed końcem rundy; oceń je „Znam”.
5. Podsumowanie: „Znane od razu: 15”, „Powtórzone: 3” z listą tych słówek i czasem rundy.
   „Jeszcze raz” zaczyna nową rundę; „Wróć do zestawów” prowadzi na listę.
6. W trakcie rundy „Zakończ” → lista zestawów.
7. Otwórz `/flashcards?set=nieistniejacy` → „Nie znaleziono zestawu” z linkiem do listy.
8. Otwórz `/1` → przekierowanie na listę zestawów.
9. Włącz w systemie/DevTools „prefers-reduced-motion: reduce” → karta zmienia stronę bez obrotu.
10. Zdania z pliku ITA5 (najdłuższe pozycje) mieszczą się na karcie bez przewijania w poziomie.

## Scenariusz US2 — postęp słówek (build produkcyjny dla kroku offline)

1. Zestaw ITA5 (18 słówek), lista pokazuje „Opanowane: 0 / 18”.
2. Sesja: oceń 3 karty „Nie znam” przy pierwszym pokazaniu, potem dokończ rundę.
3. Przeładuj stronę i wybierz „Fiszki” ponownie → pierwsze 3 karty to te słówka.
4. W trakcie sesji oceń kilka kart i zamknij kartę przeglądarki → po ponownym otwarciu te oceny
   wpływają na kolejność (zapis przy każdej ocenie).
5. Przejdź 2 sesje, oceniając każdą kartę „Znam” przy pierwszym pokazaniu → lista pokazuje
   „Opanowane: 18 / 18”; jedna ocena „Nie znam” zmniejsza licznik o 1.
6. `npm run build && npm start`, przejdź sesję online, DevTools → Offline, przeładuj → oceny i
   „Opanowane” zachowane.
7. Aktualizacja z poprzedniej wersji: zestawy zaimportowane przed tą zmianą nadal są na liście
   (migracja bazy v1 → v2).

## Scenariusz US3 — kierunek polski → włoski

1. Otwórz fiszki zestawu → przełącznik „IT → PL / PL → IT” nad kartą, zaznaczone „IT → PL”.
2. Wybierz „PL → IT” przed odwróceniem → przód karty po polsku, po odwróceniu włoski (z polskim
   mniejszym drukiem nad nim).
3. Odwróć kartę i przełącz kierunek → karta wraca na przód w nowym kierunku; licznik „Znane”
   i kolejka bez zmian.
4. Fokus na przełączniku, naciśnij ← / → → zmienia się zaznaczona opcja, karta NIE jest oceniana.
5. Przeładuj stronę i otwórz inny zestaw → kierunek nadal „PL → IT”.
6. „Jeszcze raz” po zakończeniu rundy zachowuje wybrany kierunek.
7. Tryb prywatny / zablokowana pamięć strony → przełącznik działa w bieżącej sesji, po
   przeładowaniu wraca „IT → PL”, bez błędów.
