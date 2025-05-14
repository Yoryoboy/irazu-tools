import { RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MQMSTask } from '@/types/Task';
import { handleSyncAllTasks, handleSyncTask } from './TaskSync.functions';
import { useState, useEffect } from 'react';

interface TasksTableProps {
  newTasks: MQMSTask[];
  syncingTasks: Record<string, boolean>;
  selectedList: string | null;
}

export function TasksTable({ 
  newTasks, 
  syncingTasks, 
  selectedList
}: TasksTableProps) {

  const [tasks, setTasks] = useState<MQMSTask[]>(newTasks);

  console.log(tasks);

  // Actualizar el estado local cuando cambian las tareas del padre
  useEffect(() => {
    setTasks(newTasks);
  }, [newTasks]);

  const handleSyncSingleTask = async (task: MQMSTask) => {
    if (!selectedList) return;
    
    // Llamar a handleSyncTask que ahora solo se encarga de crear la tarea
    const result = await handleSyncTask(task, selectedList);
    
    // Si la sincronización fue exitosa, actualizar el estado local
    if (result.success && result.taskId) {
      setTasks((prevTasks: MQMSTask[]) => {
        return prevTasks.filter((t: MQMSTask) => t.REQUEST_ID !== task.REQUEST_ID);
      });
    }
  };

  const handleSyncAll = async () => {
    if (!selectedList) return;
    
    // Llamar a handleSyncAllTasks que ahora solo se encarga de crear las tareas
    const result = await handleSyncAllTasks(tasks, selectedList);

    console.log("result", result);
    
    // Si la sincronización fue exitosa, actualizar el estado local
    if (result.success && result.syncedTaskIds && result.syncedTaskIds.length > 0) {
      setTasks((prevTasks: MQMSTask[]) => {
        return prevTasks.filter((task: MQMSTask) => 
          !result.syncedTaskIds.includes(task.EXTERNAL_ID)
        );
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">New Tasks ({tasks.length})</h2>
        <Button
          onClick={handleSyncAll}
          className="bg-[#3B82F6] hover:bg-blue-600"
          disabled={Object.keys(syncingTasks).length > 0}
        >
          {Object.keys(syncingTasks).length === tasks.length ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing All...
            </>
          ) : (
            "Sync All Tasks"
          )}
        </Button>
      </div>  

      <div className="rounded-lg border border-gray-700 overflow-hidden max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader className="bg-gray-800 sticky top-0">
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Task ID</TableHead>
              <TableHead className="text-gray-300">Secondary ID</TableHead>
              <TableHead className="text-gray-300">Priority</TableHead>
              <TableHead className="text-gray-300">Project Type</TableHead>
              <TableHead className="text-gray-300">Node Name</TableHead>
              <TableHead className="text-gray-300 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.REQUEST_ID} className="border-gray-700 hover:bg-gray-800/50">
                <TableCell>{task.EXTERNAL_ID}</TableCell>
                <TableCell>{task.SECONDARY_EXTERNAL_ID}</TableCell>
                <TableCell>
                  {task['MASTER PROJECT NAME'] === "RAPID BUILD" && (
                    <Badge
                      className="bg-red-500/20 text-red-400 border-red-500/50"
                    >
                      {task['MASTER PROJECT NAME']}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{task.PROJECT_TYPE}</TableCell>
                <TableCell>{task.NODE_NAME}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10"
                    onClick={() => handleSyncSingleTask(task)}
                    disabled={syncingTasks[task.EXTERNAL_ID]}
                  >
                    {syncingTasks[task.EXTERNAL_ID] ? (
                      <>
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      "Sync"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
