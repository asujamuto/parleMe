# Contract: format pliku CSV ze słówkami

Interfejs zewnętrzny aplikacji — plik przygotowany przez użytkownika lub lektora.

## Wymagania

- Kodowanie UTF-8, z BOM lub bez.
- Separator: przecinek `,` lub średnik `;` (wykrywany automatycznie).
- Końce linii: LF lub CRLF.
- Pierwszy wiersz to nagłówek. Wymagane kolumny: `italian`, `polish` — wielkość liter,
  spacje wokół nazw i kolejność kolumn nie mają znaczenia. Dodatkowe kolumny są ignorowane.
- Wartości zawierające separator lub cudzysłów ujmuje się w cudzysłowy (`"Sì, certo"`).
- Limity: maks. 1 MB i 2000 wierszy danych.

## Przykład (wzór)

```csv
italian,polish
ciao,cześć
grazie,dziękuję
"Sì, certo",Tak oczywiście
Cosa prendi?,Co bierzesz? / Co zamawiasz?
```

## Wynik importu

| Sytuacja | Efekt |
|----------|-------|
| Wiersz z pustą wartością `italian` lub `polish` | pominięty, „Wiersz N: brak tekstu w kolumnie polish” |
| Wiersz w pełni pusty w środku pliku | pominięty, „Wiersz N: pusty wiersz” |
| Puste linie na końcu pliku | ignorowane bez komunikatu |
| Powtórzona para (bez rozróżniania wielkości liter i spacji) | pominięta, „Wiersz N: powtórzenie wiersza M” |
| Brak wymaganej kolumny / pusty plik / brak poprawnych par / limit | import zablokowany |

## Eksport (dalej, FR-016)

Eksport zapisuje UTF-8 z BOM, separator `,`, nagłówek `italian,polish`, cudzysłowy wg RFC 4180 —
plik musi dać się ponownie zaimportować bez różnic (SC-005).
