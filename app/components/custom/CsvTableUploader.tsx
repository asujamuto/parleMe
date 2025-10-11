"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

import { handleFileUpload } from "@/utils/fileUploadHandler";
import { useEffect } from "react";

type CsvRow = {
  italian: string;
  polish: string;
};

export default function CsvTableUploader({ text } : { text: string}) {
  const [data, setData] = useState<CsvRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [csv, setCSV] = useState();

  useEffect(() => {
    // setCSV(text);
    handleFileUpload({text, setData, setError});
  }, [text])

  return (
    <Card className="max-w-3xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Importuj CSV z fiszkami</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {data.length > 0 && (
          <div className="overflow-x-auto border rounded-2xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Italian</TableHead>
                  <TableHead>Polish</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.italian}</TableCell>
                    <TableCell>{row.polish}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {data.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">Wybierz plik CSV z kolumnami <b>italian</b> i <b>polish</b>.</p>
        )}
      </CardContent>
    </Card>
  );
}
