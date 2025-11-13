import { useMemo } from 'react';
import { useFetchClickUpTasks } from './useClickUp';
import { formatApprovedHsTasks, formatHsIncomeDataForExcel } from '../utils/tasksFunctions';
import { hsPrices } from '../pages/IncomeReports/IncomeReports.config';
import { SearchParams } from '../types/SearchParams';
import { Task, ApprovedBauTasks, BauIncomeData } from '../types/Task';

interface UseHsIncomeReportReturn {
  rawHsTasks: Task[];
  rawRedesignTasks: Task[];
  formattedTasks: ApprovedBauTasks[];
  incomeData: BauIncomeData[];
}

export function useHsIncomeReport(
  listId: string,
  hsSearchParams: SearchParams | null,
  redesignSearchParams: SearchParams | null
): UseHsIncomeReportReturn {
  const { clickUpTasks: hsClickUpTasks } = useFetchClickUpTasks(listId, hsSearchParams);
  const { clickUpTasks: redesignClickUpTasks } = useFetchClickUpTasks(listId, redesignSearchParams);

  const formattedTasks = useMemo(
    () => formatApprovedHsTasks([...hsClickUpTasks, ...redesignClickUpTasks]),
    [hsClickUpTasks, redesignClickUpTasks]
  );

  const incomeData = useMemo(
    () => formatHsIncomeDataForExcel(formattedTasks, hsPrices),
    [formattedTasks]
  );

  return {
    rawHsTasks: hsClickUpTasks,
    rawRedesignTasks: redesignClickUpTasks,
    formattedTasks,
    incomeData,
  };
}
