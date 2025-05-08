import { useState } from 'react';
import { MQMSTask } from '@/types/Task';
import { useFetchClickUpTasks } from '@/hooks/useClickUp';
import { getNewTasksFromMqms } from '@/utils/tasksFunctions';
import { DEFAULT_SEARCH_PARAMS } from './TaskSync.config';
import { useTaskProcessing, handleSyncTask, handleSyncAllTasks } from './TaskSync.functions';
import { ListSelector } from './ListSelector';
import { FileUploader } from './FileUploader';
import { StatusPanel } from './StatusPanel';
import { ProcessButton } from './ProcessButton';
import { TasksTable } from './TasksTable';

function TaskSyncListSelector() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [syncingTasks, setSyncingTasks] = useState<Record<string, boolean>>({});
  
  
  const { isProcessing, MQMSTasks, setMQMSTasks, processTasks } = useTaskProcessing();

  const { clickUpTasks, loading: loadingClickUpData } = useFetchClickUpTasks(
    selectedList || '',
    DEFAULT_SEARCH_PARAMS
  );

  const newTasks = MQMSTasks.length > 0 ? getNewTasksFromMqms(MQMSTasks, clickUpTasks) : [];

  const handleListChange = (listId: string) => {
    setSelectedList(listId);
  };
  
  // Wrapper functions to handle task syncing
  const handleSyncSingleTask = (task: MQMSTask) => {
    handleSyncTask(task, newTasks, setMQMSTasks, selectedList as string);
  };

  const handleSyncAll = () => {
    handleSyncAllTasks(newTasks, setMQMSTasks, selectedList as string);
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
          onProcess={() => processTasks(file)}
          disabled={isProcessing || MQMSTasks.length > 0}
        />
      )}
      
      {newTasks.length > 0 && (
        <TasksTable
          newTasks={newTasks}
          syncingTasks={syncingTasks}
          onSyncAll={handleSyncAll}
          onSyncTask={handleSyncSingleTask}
        />
      )}
    </div>
  );
}

export default TaskSyncListSelector;
