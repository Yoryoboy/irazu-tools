import { useState } from 'react';
import * as XLSX from 'xlsx';
import { MQMSTask, ParsedData } from '@/types/Task';
import { cleanData, handleAction, handleSyncAll } from '@/utils/tasksFunctions';
import { DESIRED_KEYS } from './TaskSync.config';

interface UseTaskProcessingResult {
  isProcessing: boolean;
  MQMSTasks: MQMSTask[];
  setMQMSTasks: React.Dispatch<React.SetStateAction<MQMSTask[]>>;
  processTasks: (file: File | null) => void;
}

/**
 * Custom hook to handle Excel file processing for MQMS tasks
 */
export function useTaskProcessing(): UseTaskProcessingResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [MQMSTasks, setMQMSTasks] = useState<MQMSTask[]>([]);

  /**
   * Process an Excel file to extract MQMS tasks
   * @param file The Excel file to process
   */
  const processTasks = (file: File | null) => {
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = e => {
      const binaryStr = e.target?.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
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
      setMQMSTasks(parsedDataCleaned);
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return {
    isProcessing,
    MQMSTasks,
    setMQMSTasks,
    processTasks
  };
}

/**
 * Handles syncing a single task with ClickUp
 * @param task The task to sync
 * @param newTasks All new tasks
 * @param setMQMSTasks Function to update MQMS tasks
 * @param selectedList The selected ClickUp list
 */
export const handleSyncTask = (task: MQMSTask, newTasks: MQMSTask[], setMQMSTasks: React.Dispatch<React.SetStateAction<MQMSTask[]>>, selectedList: string) => {
  handleAction(task, newTasks, setMQMSTasks, selectedList);
};

/**
 * Handles syncing all tasks with ClickUp
 * @param newTasks All new tasks
 * @param setMQMSTasks Function to update MQMS tasks
 * @param selectedList The selected ClickUp list
 */
export const handleSyncAllTasks = (newTasks: MQMSTask[], setMQMSTasks: React.Dispatch<React.SetStateAction<MQMSTask[]>>, selectedList: string) => {
  handleSyncAll(newTasks, setMQMSTasks, selectedList);
};