import { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

export interface ParsedData {
  [key: string]: string | number;
}

const DESIRED_KEYS = [
  "JOB_NAME",
  "EXTERNAL_ID",
  "SECONDARY_EXTERNAL_ID",
  "REQUEST_NAME",
  "PROJECT_TYPE",
];

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedData[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile); // Guarda el archivo en el estado
  };

  const handleProcessFile = () => {
    if (!file) return; // Verifica que haya un archivo seleccionado
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetData = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
      });

      const [headers, ...rows] = sheetData as [string[], ...string[][]];

      const parsedData = rows.map((row: string[]) =>
        headers.reduce((acc, header, index) => {
          acc[header as string] = row[index];
          return acc;
        }, {} as ParsedData)
      );
      const parsedDataCleaned = cleanData(parsedData, DESIRED_KEYS);
      setData(parsedDataCleaned);
    };
    reader.readAsArrayBuffer(file);
  };

  function cleanData(rawData: ParsedData[], desiredKeys: string[]) {
    return rawData.map((obj) =>
      desiredKeys.reduce((acc: Record<string, string | number>, key) => {
        if (obj[key] !== null && obj[key] !== undefined) {
          acc[key] = obj[key as string];
        }
        return acc;
      }, {})
    );
  }

  return (
    <main>
      <input
        type="file"
        id="excel-upload"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />
      <button disabled={!file} onClick={handleProcessFile}>
        Procesar archivo
      </button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}

export default App;
