import { toast } from 'sonner';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { useDropzone } from 'react-dropzone';
import { Upload, Check, AlertCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import TaskSync from './TaskSync';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNewMqmsTasks } from '@/hooks/useNewMqmsTasks';
import { useFetchClickUpTasks } from '@/hooks/useClickUp';

const options: CheckboxGroupProps<string>['options'] = [
  { label: 'HighSplit', value: '' },
  { label: 'BAU', value: 'bau' },
];

const DEFAULT_SEARCH_PARAMS = {};

function TaskSyncListSelector() {
  const [clickUpDataFetched, setClickUpDataFetched] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedList, setSelectedList] = useState<keyof typeof CLICKUP_LIST_IDS | null>(null);

  const { clickUpTasks } = useFetchClickUpTasks(selectedList as string, DEFAULT_SEARCH_PARAMS);

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
    setSelectedList(value as keyof typeof CLICKUP_LIST_IDS);
  };

  return (
    <div className="max-w-6xl m-4 space-y-8 text-gray-100">
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
              {clickUpDataFetched ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              ClickUp Data: {clickUpDataFetched ? 'Fetched' : 'Pending'}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default TaskSyncListSelector;
