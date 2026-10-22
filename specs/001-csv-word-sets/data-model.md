# Data Model: Import CSV i zarządzanie zestawami słówek

Model obejmuje całą funkcję; w P1 używane są `WordSet`, `WordEntry` i `ImportReport`.

## WordSet (trwały, magazyn `wordSets`)

| Pole | Typ | Reguły |
|------|-----|--------|
| `id` | string (UUID) | nadawany przy utworzeniu, niezmienny |
| `name` | string | po `trim` 1–60 znaków (FR-007); nazwy mogą się powtarzać (ostrzeżenie w UI) |
| `source` | `'csv' \| 'sample' \| 'manual'` | P1: zawsze `'csv'` |
| `sourceFileName` | string \| null | nazwa importowanego pliku |
| `entryCount` | number | liczba słówek; aktualizowana w tej samej transakcji co słówka |
| `createdAt` | string (ISO 8601) | sortowanie listy malejąco (FR-009) |
| `updatedAt` | string (ISO 8601) | = `createdAt` przy utworzeniu |

Indeksy: `createdAt`.

## WordEntry (trwały, magazyn `wordEntries`)

| Pole | Typ | Reguły |
|------|-----|--------|
| `id` | string (UUID) | stały (FR-020) — klucz dla przyszłego postępu nauki |
| `setId` | string | → `WordSet.id`; usunięcie zestawu usuwa jego słówka (US2) |
| `italian` | string | po `trim`, niepusty, oryginalna pisownia i znaki |
| `polish` | string | po `trim`, niepusty; warianty (`A / B`) jako jeden tekst |
| `position` | number | kolejność z pliku, od 0 |

Indeksy: `setId`.

Relacja: WordSet 1 — N WordEntry. Słówko należy do dokładnie jednego zestawu.

## ImportReport (nietrwały, wynik `parseWordsCsv`)

| Pole | Typ | Opis |
|------|-----|------|
| `status` | `'ok' \| 'blocked'` | `blocked` → zapis niemożliwy (FR-005) |
| `blockingError` | `ImportBlockingError \| null` | przyczyna blokady |
| `pairs` | `{ italian, polish, line }[]` | poprawne, unikalne pary w kolejności z pliku |
| `skipped` | `{ line, reason }[]` | pominięte wiersze; `reason` po polsku (FR-003) |
| `duplicates` | `{ line, firstLine }[]` | powtórzenia pominięte (FR-006) |
| `totalRows` | number | liczba rekordów danych (bez nagłówka i końcowych pustych linii) |

`ImportBlockingError.code`:

| Kod | Kiedy | Komunikat (skrót) |
|-----|-------|-------------------|
| `FILE_TOO_LARGE` | plik > 1 MB | „Plik jest za duży (maks. 1 MB).” |
| `EMPTY_FILE` | brak treści | „Plik jest pusty.” |
| `MISSING_COLUMNS` | brak `italian` lub `polish` w nagłówku | wymienia brakujące kolumny + przykład |
| `TOO_MANY_ROWS` | > 2000 rekordów | „Plik ma więcej niż 2000 wierszy.” |
| `NO_VALID_ROWS` | 0 poprawnych par | „Nie znaleziono żadnej poprawnej pary słówek.” |
| `UNREADABLE` | błąd odczytu / nie-tekst | „Nie udało się odczytać pliku jako CSV.” |

## Przejścia stanów przepływu importu (UI, nietrwałe)

```text
wybór pliku → analiza → [blocked] → komunikat → wybór pliku
                      → [ok] → podgląd + nazwa → Zapisz → zapis (transakcja) → lista zestawów
                                                → Anuluj → stan początkowy (nic nie zapisano)
                                     zapis nieudany → komunikat, podgląd zachowany
```

## Poza P1 (dalej)

- `StudySource` (wybrany zestaw do nauki, FR-013) — magazyn `settings`, klucz `studySource`.
- Postęp nauki — osobna funkcja; odwołuje się do `WordEntry.id`.
