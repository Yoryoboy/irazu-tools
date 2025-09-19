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
    <Card className="relative overflow-hidden border-slate-800/70 bg-slate-900/70">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
      <CardHeader className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-[0.35em] text-emerald-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-xs font-semibold text-emerald-200">
            PASO 2
          </span>
          <span className="font-semibold tracking-[0.28em] text-emerald-200">Importa tu archivo</span>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-slate-50">Importar tareas desde MQMS</CardTitle>
          <CardDescription className="text-sm text-slate-400">
            Carga el archivo Excel exportado desde MQMS para detectar tareas que aún no existen en ClickUp.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="mqms-file" className="text-slate-200">
            Archivo Excel (.xlsx o .xls)
          </Label>
          <Input
            id="mqms-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="cursor-pointer border-dashed border-slate-700/70 bg-slate-950/60 text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:border-emerald-400/60"
          />
        </div>
        {file && (
          <Badge variant="secondary" className="w-fit bg-slate-800/90 text-slate-100">
            {file.name}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 border-t border-slate-800/70 bg-slate-900/60 sm:flex-row sm:items-center">
        <Button onClick={handleProcessFile} disabled={!file || parsing} className="w-full sm:w-auto">
          {parsing ? 'Procesando archivo…' : 'Procesar archivo'}
        </Button>
        <p className="text-xs leading-relaxed text-slate-400">
          Columnas requeridas:{' '}
          <span className="text-slate-200">{DESIRED_KEYS.join(', ')}</span>
        </p>
      </CardFooter>
    </Card>
  );
}
