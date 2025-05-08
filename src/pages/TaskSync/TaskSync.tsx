import { useState } from 'react';
import { MQMSTask, ParsedData } from '@/types/Task';
import * as XLSX from 'xlsx';
import { useFetchClickUpTasks } from '@/hooks/useClickUp';
import { cleanData, getNewTasksFromMqms, handleAction, handleSyncAll } from '@/utils/tasksFunctions';
import { DEFAULT_SEARCH_PARAMS, DESIRED_KEYS } from './TaskSync.config';
import { ListSelector } from './ListSelector';
import { FileUploader } from './FileUploader';
import { StatusPanel } from './StatusPanel';
import { ProcessButton } from './ProcessButton';
import { TasksTable } from './TasksTable';

function TaskSyncListSelector() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [MQMSTasks, setMQMSTasks] = useState<MQMSTask[]>([]);
  const [syncingTasks, setSyncingTasks] = useState<Record<string, boolean>>({});

  const { clickUpTasks, loading: loadingClickUpData } = useFetchClickUpTasks(
    selectedList || '',
    DEFAULT_SEARCH_PARAMS
  );

  const newTasks = MQMSTasks.length > 0 ? getNewTasksFromMqms(MQMSTasks, clickUpTasks) : [];

  const handleListChange = (listId: string) => {
    setSelectedList(listId);
  };

  function processTasks() {
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
  }

  const handleSyncTask = (task: MQMSTask) => {
    handleAction(task, newTasks, setMQMSTasks, selectedList as string);
  };

  const handleSyncAllTasks = () => {
    handleSyncAll(newTasks, setMQMSTasks, selectedList as string);
  };

  return (
    <div className="max-w-7xl m-4 space-y-8 text-gray-100 overflow-y-auto">
      <h1 className="text-3xl font-bold">ClickUp MQMS Integration</h1>
      <p className="text-gray-400">
        Upload an Excel file to compare and synchronize tasks with ClickUp
      </p>

      <ListSelector onListChange={handleListChange} />

      {selectedList && <FileUploader file={file} setFile={setFile} />}

      {selectedList && <StatusPanel file={file} loadingClickUpData={loadingClickUpData} />}

      {file && clickUpTasks.length > 0 && (
        <ProcessButton
          isProcessing={isProcessing}
          hasProcessedTasks={MQMSTasks.length > 0}
          onProcess={processTasks}
          disabled={isProcessing || MQMSTasks.length > 0}
        />
      )}

      
      {newTasks.length > 0 && (
        <TasksTable
          newTasks={newTasks}
          syncingTasks={syncingTasks}
          onSyncAll={handleSyncAllTasks}
          onSyncTask={handleSyncTask}
        />
      )}
    </div>
  );
}

export default TaskSyncListSelector;
