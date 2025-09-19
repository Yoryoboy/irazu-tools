import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
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
          acc[key] = '' as MQMSTask[typeof key];
        }
        return acc;
      }, {} as Partial<MQMSTask>) as MQMSTask
    );
  }

  return (
    <Card className="relative overflow-hidden border-zinc-800/60">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
      <CardHeader>
        <CardTitle>Importar tareas desde MQMS</CardTitle>
        <CardDescription>
          Carga el archivo Excel exportado desde MQMS para detectar tareas que aún no existen en ClickUp.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="mqms-file">Archivo Excel (.xlsx o .xls)</Label>
          <Input
            id="mqms-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="cursor-pointer border-dashed border-zinc-700/80 bg-zinc-950/40 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500/90 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-900 hover:border-emerald-500/40"
          />
        </div>
        {file && (
          <Badge variant="secondary" className="w-fit">
            {file.name}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button onClick={handleProcessFile} disabled={!file || parsing} className="w-full sm:w-auto">
          {parsing ? 'Procesando archivo…' : 'Procesar archivo'}
        </Button>
        <p className="text-xs leading-relaxed text-zinc-400">
          Columnas requeridas: <span className="text-zinc-300">{DESIRED_KEYS.join(', ')}</span>
        </p>
      </CardFooter>
    </Card>
  );
}
