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
