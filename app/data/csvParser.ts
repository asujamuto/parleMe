import fs from "fs";
import path from "path";
import csv from "csv-parser";

type Expression = {
  italian: string;
  polish: string;
};

export async function loadExpressions(filePath: string): Promise<Expression[]> {
  return new Promise((resolve, reject) => {
    const results: Expression[] = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(), // 👈 usuwa spacje i ukryte znaki
        })
      )
      .on("data", (data) => {
        results.push({
          italian: data.italian?.trim(),
          polish: data.polish?.trim(),
        });
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

// Przykład użycia
(async () => {
  const filePath = path.join("2ita1", "ITA5(Codzienne zwroty i pytania ).csv");
  const idioms = await loadExpressions(filePath);

  console.log("✅ Wczytano idiomy:", idioms.length);
  console.log(idioms.slice(0, 5));
})();
