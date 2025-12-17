import { useMemo } from 'react';
import { useFetchClickUpTasks } from './useClickUp';
import { formatApprovedTrueNetTasks, formatBauIncomeDataForExcel } from '../utils/tasksFunctions';
import { trueNetPrices } from '../pages/IncomeReports/IncomeReports.config';
import { SearchParams } from '../types/SearchParams';
import { Task, ApprovedBauTasks, BauIncomeData } from '../types/Task';

interface UseTrueNetIncomeReportReturn {
  rawTasks: Task[];
  formattedTasks: ApprovedBauTasks[];
  incomeData: BauIncomeData[];
}

export function useTrueNetIncomeReport(
  listId: string,
  searchParams: SearchParams | null
): UseTrueNetIncomeReportReturn {
  const { clickUpTasks } = useFetchClickUpTasks(listId, searchParams);

  const formattedTasks = useMemo(() => formatApprovedTrueNetTasks(clickUpTasks), [clickUpTasks]);

  const incomeData = useMemo(
    () => formatBauIncomeDataForExcel(formattedTasks, trueNetPrices),
    [formattedTasks]
  );

  return {
    rawTasks: clickUpTasks,
    formattedTasks,
    incomeData,
  };
}
