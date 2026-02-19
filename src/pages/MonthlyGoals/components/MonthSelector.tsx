import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dayjs } from '@/utils/dayjs';
import { ARGENTINA_TZ } from '../MonthlyGoals.constants';

interface MonthSelectorProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function MonthSelector({
  month,
  year,
  onMonthChange,
  onYearChange,
}: MonthSelectorProps) {
  const currentYear = dayjs().tz(ARGENTINA_TZ).year();

  const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1;
    const label = dayjs().month(index).format('MMMM');

    return {
      value: monthNumber,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    };
  });

  const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);

  const selectedMonthLabel = monthOptions.find(option => option.value === month)?.label;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={String(month)} onValueChange={value => onMonthChange(Number(value))}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map(option => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(year)} onValueChange={value => onYearChange(Number(value))}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map(option => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Badge variant="secondary" className="text-xs font-normal">
        Showing: {selectedMonthLabel} {year}
      </Badge>
    </div>
  );
}
