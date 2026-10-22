# Quickstart: walidacja P1 (import CSV)

## Wymagania wstępne

- Node.js ≥ 20, npm.
- `npm install` w katalogu repozytorium.

## Kontrole automatyczne (bramki jakości)

```sh
npm run lint     # bez błędów
npm test         # Vitest: parser CSV, nazwy zestawów, buildWordSet, repozytorium
npm run build    # build produkcyjny przechodzi
```

Oczekiwane w `npm test`: testy obejmują 4 pliki z `app/data/2ita1/` (razem 57 par, 0 pominiętych,
treść identyczna ze źródłem — SC-002) oraz plik 2000 wierszy (SC-003, parsowanie < 2 s).

## Scenariusz ręczny (telefon lub emulacja 360 px w DevTools, potem sama klawiatura)

1. `npm run dev`, otwórz `http://localhost:3000`.
2. Pusta aplikacja → ekran startowy z przyciskiem „Importuj CSV”.
3. Importuj `app/data/2ita1/ITA5(Zwierzęta i porównania (idiomy)).csv` → podgląd: 18 par,
   0 pominiętych; proponowana nazwa = nazwa pliku. Zapisz → lista pokazuje zestaw „18 słówek”.
4. Importuj plik testowy z błędami (pusta wartość w wierszu 3, powtórzenie w wierszu 5,
   separator `;`) → podgląd wymienia „Wiersz 3: …”, „Wiersz 5: powtórzenie wiersza …”.
5. Importuj plik bez kolumny `polish` → import zablokowany, komunikat z przykładem formatu.
6. Rozpocznij import i wybierz „Anuluj” → lista zestawów bez zmian.
7. Importuj ponownie plik z kroku 3 → ostrzeżenie o istniejącej nazwie, propozycja „… (2)”.
8. Test offline wymaga buildu produkcyjnego (service worker nie działa w `npm run dev`):
   `npm run build && npm start`, otwórz stronę raz online, zaimportuj zestaw, następnie
   DevTools → Network: Offline i przeładuj stronę → aplikacja się otwiera, zestawy widoczne
   (SC-006).
9. Powtórz kroki 2–3 wyłącznie klawiaturą (Tab/Enter/Spacja) — każdy krok osiągalny (SC-007);
   brak przewijania w poziomie przy 360 px.

## Scenariusz US2 — przeglądanie i zarządzanie zestawami

1. Zaimportuj 3 pliki ITA5 → lista pokazuje 3 zestawy od najnowszego.
2. Dotknij nazwy zestawu → strona zestawu z liczbą słówek, datą i pełną listą par
   (włoski z `lang="it"`), akcje „Fiszki”, „Zmień nazwę”, „Usuń”.
3. „Zmień nazwę” → pusta nazwa jest odrzucona z komunikatem; nazwa innego zestawu → ostrzeżenie
   z propozycją „(2)”; poprawna nazwa → widoczna na stronie zestawu i na liście.
4. Uruchom fiszki zestawu, wróć na listę → zestaw oznaczony „Ostatnio uczony” (także po
   przeładowaniu).
5. „Usuń” → okno potwierdzenia; „Anuluj” → nic się nie zmienia; „Usuń zestaw” → powrót na listę,
   komunikat, zestaw zniknął; etykieta „Ostatnio uczony” znika, jeśli dotyczyła tego zestawu.
6. Otwórz `/set?id=nieistniejacy` → „Nie znaleziono zestawu” z linkiem do listy.
7. Wszystkie kroki dotykiem na 360 px i samą klawiaturą (okna dialogowe: Tab, Esc zamyka).
