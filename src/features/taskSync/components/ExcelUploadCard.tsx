import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { MQMSTask, ParsedData } from '../../../types/Task';
import { DESIRED_KEYS } from '../config/mqmsSchema';

interface Props {
  setData: (data: MQMSTask[]) => void;
}

export default function ExcelUploadCard({ setData }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState<boolean>(false);

  const handleProcessFile = () => {
    if (!file) return;
    setParsing(true);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const binaryStr = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(binaryStr, { type: 'buffer' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        const [headers, ...rows] = sheetData as [string[], ...string[][]];

        const parsedData = rows.map((row: string[]) =>
          headers.reduce((acc, header, index) => {
            const value = row[index];
            acc[header as string] = value !== undefined && value !== null ? String(value) : value;
            return acc;
          }, {} as ParsedData)
        );

        const cleaned = cleanData(parsedData);
        setData(cleaned);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  function cleanData(rawData: ParsedData[]): MQMSTask[] {
    return rawData.map(obj =>
      DESIRED_KEYS.reduce((acc: Partial<MQMSTask>, key) => {
        if (obj[key] !== null && obj[key] !== undefined) {
          acc[key] = obj[key] as MQMSTask[typeof key];
        } else {
          // Ensure key exists as empty string to keep strict typing and predictable rendering
          acc[key] = '' as MQMSTask[typeof key];
        }
        return acc;
      }, {} as Partial<MQMSTask>) as MQMSTask
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/40">
        <h2 className="text-lg font-semibold mb-3">Cargar Excel de MQMS</h2>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
          />
          <button
            type="button"
            disabled={!file || parsing}
            onClick={handleProcessFile}
            className="px-4 py-2 rounded-md bg-indigo-600 disabled:bg-zinc-700 disabled:cursor-not-allowed hover:bg-indigo-500 text-white text-sm"
          >
            {parsing ? 'Procesando…' : 'Procesar archivo'}
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-400">Columnas esperadas: {DESIRED_KEYS.join(', ')}</p>
      </div>
    </div>
  );
}
