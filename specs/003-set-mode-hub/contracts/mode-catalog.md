# Contract: katalog trybów (`lib/modes/catalog.ts`) i ostatni tryb (`lib/preferences/last-mode.ts`)

| Funkcja / stała | Zwraca | Zachowanie |
|-----------------|--------|------------|
| `STUDY_MODES` | `readonly StudyMode[]` | 4 tryby w stałej kolejności (data-model) |
| `getTileState(mode, wordCount)` | `'available' \| 'coming-soon' \| 'too-few-words'` | reguła z data-model |
| `modeHref(modeId, setId)` | string \| null | adres dostępnego trybu; `null` dla trybów bez trasy |
| `loadLastModes(storage?)` | `Record<string, StudyModeId>` | odporne na błędy |
| `saveLastMode(setId, modeId, storage?)` | void | nigdy nie rzuca |
| `clearLastMode(setId, storage?)` | void | usuwa wpis zestawu; nigdy nie rzuca |

Dodanie nowego trybu (kolejne specyfikacje): zmiana `status` na `available` i wpis w
`modeHref` — bez zmian w panelu i innych trybach.
