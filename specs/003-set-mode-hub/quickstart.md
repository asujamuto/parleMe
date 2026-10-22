# Quickstart: walidacja panelu zestawu

## Kontrole automatyczne

```sh
npx tsc --noEmit && npm run lint && npm test && npm run build
```

## Scenariusz ręczny (`npm run dev`, 360 px, potem sama klawiatura)

1. Lista zestawów → przy zestawie przycisk „Ucz się” (nazwa zestawu też prowadzi na panel).
2. Panel: nazwa, „N słówek”, „Opanowane: X / N”, 4 kafelki w kolejności Fiszki, Italian Word
   Tower, Dopasowywanie na czas, Grammar Runner (2 kolumny na 360 px).
3. Kafelki „Wkrótce” (3) — dotyk i Enter nic nie robią; Tab je pomija; czytnik ekranu czyta
   nazwę i „Wkrótce”.
4. „Fiszki” → sesja; „Zakończ” → powrót na panel; po rundzie „Wróć do zestawu” → panel.
5. Wróć na panel (także po przeładowaniu) → kafelek „Fiszki” z oznaczeniem „Ostatnio”; inny
   zestaw bez oznaczenia.
6. Pod kafelkami: lista słówek, „Zmień nazwę”, „Usuń” działają jak w 001; po usunięciu → lista.
7. `/set?id=nieistniejacy` → „Nie znaleziono zestawu”.
