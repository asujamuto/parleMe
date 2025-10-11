import React, { useState } from "react";
import Papa from "papaparse";

export const handleFileUpload = ({text, setData, setError}) => {
    const file = text;
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData = results.data as CsvRow[];
          if (!parsedData[0] || !("italian" in parsedData[0]) || !("polish" in parsedData[0])) {
            setError("Niepoprawny format CSV. Oczekiwane kolumny: italian, polish");
            setData([]);
            return;
          }
          setError(null);
          setData(parsedData);
        } catch (err) {
          console.error(err);
          setError("Błąd podczas przetwarzania pliku");
        }
      },
      error: (err) => {
        console.error(err);
        setError("Błąd podczas czytania pliku");
      },
    });
  };