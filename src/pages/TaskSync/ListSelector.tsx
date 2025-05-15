import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CLICKUP_LIST_IDS } from '../../utils/config';

interface ListSelectorProps {
  onListChange: (value: string) => void;
}

export function ListSelector({ onListChange }: ListSelectorProps) {
  const handleListChange = (value: string) => {
    const listId = CLICKUP_LIST_IDS[value as keyof typeof CLICKUP_LIST_IDS];
    onListChange(listId as string);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select ClickUp List</label>
      <Select onValueChange={handleListChange}>
        <SelectTrigger className="w-xs bg-gray-800 border-gray-700">
          <SelectValue placeholder="Select a list" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          <SelectItem value="cciHs" className="font-medium text-white">HighSplit</SelectItem>
          <SelectItem value="cciBau" className="font-medium text-white">BAU</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
