import { toast } from 'sonner';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { useDropzone } from 'react-dropzone';
import { Upload, Check, AlertCircle, RefreshCw, FileSpreadsheet, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFetchClickUpTasks } from '@/hooks/useClickUp';
import { MQMSTask, ParsedData } from '@/types/Task';
import * as XLSX from 'xlsx';
import { getNewTasksFromMqms, handleAction, handleSyncAll } from '@/utils/tasksFunctions';

const DESIRED_KEYS: (keyof MQMSTask)[] = [
  'REQUEST_ID',
  'JOB_NAME',
  'EXTERNAL_ID',
  'SECONDARY_EXTERNAL_ID',
  'REQUEST_NAME',
  'PROJECT_TYPE',
  'NODE_NAME',
  'HUB',
  'MASTER PROJECT NAME'
];

const DEFAULT_SEARCH_PARAMS = {};

function cleanData(rawData: ParsedData[], desiredKeys: (keyof MQMSTask)[]): MQMSTask[] {
  return rawData.map(
    obj =>
      desiredKeys.reduce((acc: Partial<MQMSTask>, key) => {
        if (obj[key] !== null && obj[key] !== undefined) {
          acc[key] = obj[key] as MQMSTask[typeof key];
        }
        return acc;
      }, {} as Partial<MQMSTask>) as MQMSTask
  );
}

function TaskSyncListSelector() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedList, setSelectedList] = useState<keyof typeof CLICKUP_LIST_IDS | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [MQMSTasks, setMQMSTasks] = useState<MQMSTask[]>([]);
  const [syncingTasks, setSyncingTasks] = useState<Record<string, boolean>>({})

  const { clickUpTasks, loading: loadingClickUpData } = useFetchClickUpTasks(
    selectedList || '',
    DEFAULT_SEARCH_PARAMS
  );

  const newTasks = MQMSTasks.length > 0 ? getNewTasksFromMqms(MQMSTasks, clickUpTasks) : [];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        toast('Excel file uploaded successfully');
      }
    },
  });

  const handleListChange = (value: string) => {
    const listId = CLICKUP_LIST_IDS[value as keyof typeof CLICKUP_LIST_IDS];
    setSelectedList(listId as keyof typeof CLICKUP_LIST_IDS);
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


  return (
    <div className="max-w-7xl m-4 space-y-8 text-gray-100 overflow-y-auto">
      <h1 className="text-3xl font-bold">ClickUp MQMS Integration</h1>
      <p className="text-gray-400">
        Upload an Excel file to compare and synchronize tasks with ClickUp
      </p>

      {/* ClickUp List Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select ClickUp List</label>
        <Select onValueChange={handleListChange}>
          <SelectTrigger className="w-full sm:w-72 bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select a list" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="cciHs">HighSplit</SelectItem>
            <SelectItem value="cciBau">BAU</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* File Upload Area */}
      {selectedList && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Excel File</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-blue-500/50'
            } cursor-pointer`}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-400">
              {isDragActive
                ? 'Drop the Excel file here'
                : 'Drag and drop an Excel file here, or click to select'}
            </p>
            <Button variant="outline" className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Upload Excel File
            </Button>
            {file && (
              <div className="mt-4 flex items-center justify-center">
                <Badge
                  variant="outline"
                  className="bg-green-500/20 text-green-400 border-green-500/50"
                >
                  <Check className="mr-1 h-3 w-3" /> {file.name}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Panel */}
      {selectedList && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Alert className="bg-gray-800 border-gray-700">
            <AlertDescription className="flex items-center">
              {file ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              Excel File: {file ? 'Uploaded' : 'Pending'}
            </AlertDescription>
          </Alert>
          <Alert className="bg-gray-800 border-gray-700">
            <AlertDescription className="flex items-center">
              {loadingClickUpData ? (
                <Loader className="h-4 w-4 text-gray-500 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              )}
              ClickUp Data: {loadingClickUpData ? 'Pending' : 'Fetched'}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Process Button */}
      {file && clickUpTasks.length > 0 && (
        <Button
          className="w-full sm:w-auto bg-[#3B82F6] hover:bg-blue-600"
          onClick={processTasks}
          disabled={isProcessing || MQMSTasks.length > 0}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : MQMSTasks.length > 0 ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Processed
            </>
          ) : (
            'Process Tasks'
          )}
        </Button>
      )}
              {/* Results Table */}
              {newTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">New Tasks ({newTasks.length})</h2>
              <Button
                onClick={()=>handleSyncAll(newTasks, setMQMSTasks, selectedList as string)}
                className="bg-[#3B82F6] hover:bg-blue-600"
                disabled={Object.keys(syncingTasks).length > 0}
              >
                {Object.keys(syncingTasks).length === newTasks.length ? (
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
                    {newTasks.map((task) => (
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
                            onClick={() => handleAction(task, newTasks, setMQMSTasks, selectedList as string)}
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
        )}
    </div>
  );
}

export default TaskSyncListSelector;
