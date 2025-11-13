import { useMemo } from 'react';
import { useFetchClickUpTasks } from './useClickUp';
import { formatApprovedBauTasks, formatBauIncomeDataForExcel } from '../utils/tasksFunctions';
import { bauPrices } from '../pages/IncomeReports/IncomeReports.config';
import { SearchParams } from '../types/SearchParams';
import { Task, ApprovedBauTasks, BauIncomeData } from '../types/Task';

interface UseBauIncomeReportReturn {
  rawTasks: Task[];
  formattedTasks: ApprovedBauTasks[];
  incomeData: BauIncomeData[];
}

export function useBauIncomeReport(
  listId: string,
  searchParams: SearchParams | null
): UseBauIncomeReportReturn {
  const { clickUpTasks } = useFetchClickUpTasks(listId, searchParams);

  const formattedTasks = useMemo(
    () => formatApprovedBauTasks(clickUpTasks),
    [clickUpTasks]
  );

  const incomeData = useMemo(
    () => formatBauIncomeDataForExcel(formattedTasks, bauPrices),
    [formattedTasks]
  );

  return {
    rawTasks: clickUpTasks,
    formattedTasks,
    incomeData,
  };
}
