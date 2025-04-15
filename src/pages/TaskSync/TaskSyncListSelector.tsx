import { Flex, Radio } from 'antd';
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
import TaskSync from './TaskSync';

const options: CheckboxGroupProps<string>['options'] = [
  { label: 'High Split', value: 'highsplit' },
  { label: 'BAU', value: 'bau' },
];

const { cciBau, cciHs } = CLICKUP_LIST_IDS;
const DEFAULT_SEARCH_PARAMS = {};

function TaskSyncListSelector() {
  const [clickUpDataFetched, setClickUpDataFetched] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);

  let taskSyncOptions: {
    listId: string;
    searchParams: typeof DEFAULT_SEARCH_PARAMS;
  } | null = null;

  if (selectedList === 'highsplit') {
    taskSyncOptions = {
      listId: cciHs,
      searchParams: DEFAULT_SEARCH_PARAMS,
    };
  } else if (selectedList === 'bau') {
    taskSyncOptions = {
      listId: cciBau,
      searchParams: DEFAULT_SEARCH_PARAMS,
    };
  }

  const handleListChange = (value: string) => {
    setSelectedList(value);
    // Simulate fetching data from ClickUp
    setTimeout(() => {
      setClickUpDataFetched(true);
      toast('ClickUp data fetched successfully');
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-gray-100">
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
            <SelectItem value="highsplit">HighSplit</SelectItem>
            <SelectItem value="bau">BAU</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default TaskSyncListSelector;
