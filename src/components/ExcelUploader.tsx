import { useState } from "react";
import * as XLSX from "xlsx";
import { MQMSTask, ParsedData } from "../types";
import styles from "./ExcelUploader.module.css";

const DESIRED_KEYS: (keyof MQMSTask)[] = [
  "REQUEST_ID",
  "JOB_NAME",
  "EXTERNAL_ID",
  "SECONDARY_EXTERNAL_ID",
  "REQUEST_NAME",
  "PROJECT_TYPE",
];

interface Props {
  setData: (data: MQMSTask[]) => void;
}

function ExcelUploader({ setData }: Props) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleProcessFile = () => {
    if (!file) return;
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

  function cleanData(
    rawData: ParsedData[],
    desiredKeys: (keyof MQMSTask)[]
  ): MQMSTask[] {
    return rawData.map(
      (obj) =>
        desiredKeys.reduce((acc: Partial<MQMSTask>, key) => {
          if (obj[key] !== null && obj[key] !== undefined) {
            acc[key] = obj[key] as MQMSTask[typeof key];
          }
          return acc;
        }, {} as Partial<MQMSTask>) as MQMSTask
    );
  }

  return (
    <section style={styles}>
      <input
        type="file"
        id="excel-upload"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />
      <button disabled={!file} onClick={handleProcessFile}>
        Procesar archivo
      </button>
    </section>
  );
}

export default ExcelUploader;
