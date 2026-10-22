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

## Scenariusz US2 — rekord zestawu

1. Zestaw bez rekordu: ekran startu bez „Rekord”; po ukończonej rundzie wynik z „Nowy rekord!”.
2. Ekran startu kolejnej rundy pokazuje „Rekord: X s”.
3. Wolniejsza runda → wynik bez wyróżnienia, z „Rekord: X s”; szybsza → „Nowy rekord!” i nowy
   czas na ekranie startu.
4. „Zakończ” w trakcie rundy → rekord bez zmian.
5. Inny zestaw ma własny rekord; usunięcie zestawu usuwa jego rekord (ponowny import → brak
   rekordu).

## Scenariusz US3 — postęp słówek

1. Zestaw ITA5: w rundzie dopasowywania pomyl się przy słówku A, dokończ rundę.
2. Otwórz fiszki tego zestawu → słówko A jest wśród pierwszych kart.
3. Słówko opanowane w fiszkach (2 sesje „Znam”) → błąd przy nim w dopasowywaniu → licznik
   „Opanowane” na panelu maleje o 1.
4. Kilka rund bezbłędnych → „Opanowane” nie rośnie od samego dopasowywania.
5. Nowa runda dopasowywania → na planszy najpierw słówka ostatnio „Nie znam”.
6. „Zakończ” w trakcie rundy → postęp bez zmian.
