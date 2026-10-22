# Implementation Plan: Import CSV i zarządzanie zestawami słówek — zakres P1

**Branch**: `001-csv-word-sets` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-csv-word-sets/spec.md`

**Note**: Plan obejmuje **User Story 1 (P1) — import zestawu z pliku CSV** wraz z minimalną
listą zestawów potrzebną do jej akceptacji. US2–US5 zostaną zaplanowane w kolejnych
iteracjach na tym samym modelu danych i kontrakcie repozytorium.

## Summary

Użytkownik wybiera plik CSV (`italian,polish`), aplikacja analizuje go w przeglądarce
(PapaParse + Zod), pokazuje podgląd z liczbą par, pominiętymi wierszami (numer + przyczyna po
polsku) i powtórzeniami, a po nadaniu nazwy zapisuje zestaw atomowo w IndexedDB. Zestaw pojawia
się na liście na ekranie głównym i jest dostępny po ponownym otwarciu aplikacji offline
(service worker). Logika jest w czystych funkcjach z testami Vitest; przy okazji usuwane są
nieistniejące już zależności Amplify, które blokują build.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict), Node.js ≥ 20 do narzędzi

**Primary Dependencies**: Next.js 15.5 (App Router), React 18.2, Tailwind 3 + shadcn/ui
(Radix), PapaParse 5.5, Zod 3.25, nowa: `idb` 8 (R2)

**Storage**: IndexedDB w przeglądarce (`parleme` v1: `wordSets`, `wordEntries`) — R1, R2

**Testing**: Vitest (env `node`) + `fake-indexeddb`; UI ręcznie wg [quickstart.md](quickstart.md)

**Target Platform**: Przeglądarki mobilne i desktopowe (ostatnie 2 wersje Chrome, Safari iOS,
Firefox); działanie offline po pierwszym załadowaniu

**Project Type**: Aplikacja webowa, wyłącznie front-end (bez backendu)

**Performance Goals**: Podgląd pliku 2000 wierszy < 2 s na telefonie średniej klasy (SC-003)

**Constraints**: Offline-capable; dane nie opuszczają urządzenia; plik ≤ 1 MB / 2000 wierszy;
ekrany od 360 px; obsługa samą klawiaturą

**Scale/Scope**: 1 użytkownik na urządzenie, dziesiątki zestawów, ≤ 2000 słówek na zestaw;
2 ekrany (lista zestawów, import)

Brak pozycji NEEDS CLARIFICATION — rozstrzygnięte w [research.md](research.md).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Zasada | Wymaganie | Jak plan je spełnia | Status |
|--------|-----------|---------------------|--------|
| I. CSV jako źródło | Zod w `utils/`, trim, pomijanie pustych, błędy PL z nr wiersza | `utils/csvParserSchema.ts` (schemat wiersza), `parseWordsCsv` (R3–R5) | ✅ |
| II. Local-first | offline, bez konta, bez backendu, eksport/usunięcie danych | IndexedDB + service worker (R2, R10); usunięcie importów Amplify (R8). Eksport/usuwanie — US2+/FR-016/019, poza P1 | ✅ |
| III. Nauka przez zabawę | dotyczy trybów nauki | nie dotyczy (funkcja danych); zapewnia stałe ID słówek pod postęp | ✅ n/d |
| IV. Wspólny rdzeń | jeden model słówka, logika jako czyste funkcje | `lib/word-sets/` (czyste funkcje + repozytorium), UI tylko wywołuje | ✅ |
| V. Testy logiki | testy jednostkowe, `npm test` | Vitest dla parsera, nazw, `buildWordSet`, repozytorium; pliki ITA5 jako fixture | ✅ |
| VI. Mobile-first, a11y | 360 px, dotyk ≥ 44 px, klawiatura, `lang="it"`, WCAG AA | komponenty shadcn, lista zamiast szerokiej tabeli, `lang="pl"` na `<html>` i `lang="it"` w podglądzie | ✅ |
| VII. Prostota | uzasadnienie nowych zależności | `idb` (R2), `vitest` + `fake-indexeddb` (wymagane przez V); SW ręcznie zamiast pakietu PWA (R10); usuwane `csv-parser`, `zod-csv`, `aws-amplify` | ✅ |
| Bramki jakości | lint, test, build, scenariusz ręczny | dodanie `.eslintrc.json`, skryptu `test`, naprawa buildu (R7, R8) | ✅ |

**Re-check po Phase 1**: model danych, kontrakty i quickstart nie wprowadzają backendu,
nowych zależności poza wymienionymi ani logiki w komponentach — brak naruszeń.

**Uwaga**: prośba o backend NestJS nie jest objęta tym planem — wymagałaby poprawki zasady II
(`/speckit-constitution`, wersja 2.0.0). Kontrakt `WordSetRepository` pozwala dodać
synchronizację później bez zmian w P1.

## Project Structure

### Documentation (this feature)

```text
specs/001-csv-word-sets/
├── plan.md              # Ten plik
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── csv-format.md            # format pliku wejściowego
│   └── word-set-repository.md   # rdzeń: czyste funkcje + repozytorium
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                    # MODIFY: bez Amplify, lang="pl", Toaster, rejestracja SW
├── page.tsx                      # REWRITE: lista zestawów + pusty stan z „Importuj CSV”
├── import/
│   └── page.tsx                  # NEW: przepływ importu
├── [slug]/page.tsx               # MODIFY: usunięcie klienta Amplify (demo do zastąpienia)
├── components/
│   ├── word-sets/                # NEW
│   │   ├── CsvFilePicker.tsx
│   │   ├── ImportPreview.tsx
│   │   ├── ImportWizard.tsx
│   │   ├── SetNameField.tsx
│   │   ├── WordSetList.tsx
│   │   └── EmptyState.tsx
│   ├── ServiceWorkerRegister.tsx # NEW
│   └── custom/                   # DELETE: CsvTableUploader, ProfileForm, providers/
└── data/csvParser.ts             # DELETE (Node fs)

lib/word-sets/                    # NEW — rdzeń (zasada IV)
├── types.ts
├── parse-csv.ts
├── set-name.ts
├── build-word-set.ts
├── repository.ts                 # interfejs + StorageError
└── indexeddb-repository.ts

hooks/use-word-sets.ts            # NEW: lista zestawów + zapis dla UI
utils/csvParserSchema.ts          # REWRITE: schemat wiersza (Zod)
utils/fileUploadHandler.ts        # DELETE
public/sw.js                      # NEW: service worker (R10)

tests/
├── fixtures/                     # pliki CSV z błędami, separatorem ;, 2000 wierszy (generowany)
└── unit/word-sets/
    ├── parse-csv.test.ts
    ├── set-name.test.ts
    ├── build-word-set.test.ts
    └── indexeddb-repository.test.ts

vitest.config.ts                  # NEW (alias @ → root)
.eslintrc.json                    # NEW (next/core-web-vitals)
next.config.js                    # MODIFY: bez swcMinify
package.json                      # MODIFY: skrypt test; +idb, +vitest, +fake-indexeddb;
                                  #         -csv-parser, -zod-csv, -aws-amplify; eslint-config-next 15
```

**Structure Decision**: Pojedynczy projekt Next.js (istniejący układ katalogów `app/`, `lib/`,
`hooks/`, `utils/`, `components/ui/`). Rdzeń domeny w `lib/word-sets/` bez zależności od
Reacta, aby tryby nauki i ewentualna przyszła synchronizacja korzystały z tego samego kodu.
Testy w `tests/unit/` odzwierciedlają strukturę `lib/`. Katalog `amplify/` pozostaje
nietknięty.

## Complexity Tracking

Brak naruszeń konstytucji — sekcja nie dotyczy.
