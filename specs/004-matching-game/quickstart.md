# Quickstart: walidacja P1 (dopasowywanie na czas)

```sh
npx tsc --noEmit && npm run lint && npm test && npm run build
```

Scenariusz ręczny (`npm run dev`, 360 px, potem sama klawiatura):

1. Panel zestawu ITA5 (18 słówek) → kafelek „Dopasowywanie na czas” aktywny → ekran startu
   (instrukcja, „Start”), stoper stoi.
2. „Start” → 12 kafelków (2 kolumny na 360 px), stoper „0,0 s” rośnie co 0,1 s.
3. Zaznacz kafelek → wyróżniony; ponownie → odznaczony; inny w tym samym języku → zaznaczenie
   przechodzi, bez kary.
4. Poprawna para → oba znikają, układ pozostałych bez zmian.
5. Błędna para → czerwone + drgnięcie (bez drgnięcia przy reduced motion), „Błędy: 1”,
   stoper +1 s.
6. Ostatnia para → wynik: czas, błędy, lista par z błędami, „Zagraj jeszcze raz” (nowe
   losowanie), „Wróć do zestawu” → panel; panel pokazuje „Ostatnio” na tym kafelku.
7. W trakcie rundy „Zakończ” → panel zestawu.
8. Zestaw z „prego/proszę” i „per favore/proszę” — nigdy oba na jednej planszy.
9. Cała runda samą klawiaturą: Tab po kafelkach, Enter/Spacja wybiera.
