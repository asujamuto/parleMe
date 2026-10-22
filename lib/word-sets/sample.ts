import { buildWordSet } from './build-word-set';
import { parseWordsCsv } from './parse-csv';

export const SAMPLE_SET_NAME = 'Przykład: ITA5';

/** Zestaw demonstracyjny (konstytucja, zasada I) — połączone pliki z app/data/2ita1, w kolejności nazw. */
export const SAMPLE_CSV = [
  "italian,polish",
  "Cosa prendi?,Co bierzesz? / Co zamawiasz?",
  "L’ultimo!,Ostatni!",
  "Scusi… posso chiedere un’informazione?,Przepraszam… czy mogę zapytać o informację?",
  "Certo! Prego.,Oczywiście! Proszę bardzo.",
  "\"Senta, i cornetti sono finiti?\",\"Proszę pana/pani, czy rogaliki się skończyły?\"",
  "\"Sofia, mi dispiace, hai sentito?\",\"Sofia, przykro mi, słyszałaś?\"",
  "non c’è problema,nie ma problemu",
  "non si preoccupi,proszę się nie martwić",
  "non ti preoccupare,nie martw się",
  "\"Ma davvero, per me è uguale eh.\",\"Ale naprawdę, dla mnie to bez różnicy.\"",
  "boh,nie wiem / kto to wie / nie mam pojęcia",
  "un attimo solo,chwileczkę",
  "un momento,moment",
  "\"Ma veramente, non è un problema.\",\"Ale naprawdę, to żaden problem.\"",
  "\"Va bene, se insiste…\",\"Dobrze, skoro pan/pani nalega…\"",
  "ringraziare,dziękować",
  "quant’è?,ile to kosztuje?",
  "\"Sì, tieni.\",\"Tak, trzymaj.\"",
  "Ecco i quattro di resto.,Oto cztery (euro) reszty.",
  "Grazie ancora.,Jeszcze raz dziękuję.",
  "Di niente,Nie ma za co",
  "Quante sorelle hai?,Ile masz sióstr?",
  "quando?,kiedy?",
  "Che cosa?,co?",
  "Che?,co?",
  "Cosa?,co?",
  "Chi?,kto?",
  "Quanto?,ile",
  "Dove?,gdzie",
  "Da dove vieni?,Skąd pochodzisz?",
  "Di dove sei?,Skąd jesteś?",
  "A che ora?,o której",
  "Come?,jak",
  "Quale?,jakie (l. poj.)",
  "Quali?,jakie (l. mn.)",
  "Perché?,dlaczego?",
  "Recupero Password,Odzyskanie hasła",
  "tipi del caffè,rodzaje kawy",
  "il ragù,spaghetti bolognese",
  "solo / fedele come un cane,samotny / wierny jak pies",
  "furbo come un gatto / una volpe,sprytny jak kot / jak lis",
  "pauroso come un coniglio,strachliwy jak królik",
  "vanitoso come un pavone,próżny jak paw",
  "testardo come un mulo,uparty jak muł",
  "mite come un agnello,łagodny jak baranek",
  "lento come una lumaca / tartaruga,wolny jak ślimak / żółw",
  "coraggioso come un leone,dzielny jak lew",
  "stupida come un'oca,głupi jak gęś",
  "scontroso come un orso,nieprzyjemny jak niedźwiedź",
  "brutto come una scimmia,brzydki jak małpa",
  "grasso come una balena / un ippopotamo,gruby jak wieloryb / hipopotam",
  "feroce come una tigre,dziki jak tygrys",
  "muto come un pesce,niemy jak ryba",
  "rosso come un gambero,czerwony jak krewetka",
  "agile come una gazzella,zwinny jak gazela",
  "cieco come una talpa,ślepy jak kret",
  "velenoso come un serpente,jadowity jak wąż",
].join('\n') + '\n';

export const TEMPLATE_FILE_NAME = 'parleme-wzor.csv';

/** Wzór formatu z contracts/csv-format.md — do pobrania na stronie importu. */
export const TEMPLATE_CSV = [
  'italian,polish',
  'ciao,cześć',
  'grazie,dziękuję',
  '"Sì, certo",Tak oczywiście',
  'Cosa prendi?,Co bierzesz? / Co zamawiasz?',
].join('\n') + '\n';

/** Zestaw przykładowy tworzony tą samą ścieżką co import pliku. */
export function buildSampleSet({ now, newId }: { now: Date; newId: () => string }) {
  const report = parseWordsCsv(SAMPLE_CSV, { fileSize: SAMPLE_CSV.length });
  return buildWordSet({ name: SAMPLE_SET_NAME, pairs: report.pairs, fileName: null, now, newId, source: 'sample' });
}
