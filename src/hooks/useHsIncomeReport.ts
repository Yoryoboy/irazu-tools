import { useMemo } from 'react';
import { useFetchClickUpTasks } from './useClickUp';
import { formatApprovedHsTasks, formatHsIncomeDataForExcel } from '../utils/tasksFunctions';
import { hsPrices } from '../pages/IncomeReports/IncomeReports.config';
import { SearchParams } from '../types/SearchParams';
import { Task, ApprovedBauTasks, BauIncomeData } from '../types/Task';

interface UseHsIncomeReportReturn {
  rawPreasbuiltTasks: Task[];
  rawDesignTasks: Task[];
  rawRedesignTasks: Task[];
  formattedTasks: ApprovedBauTasks[];
  incomeData: BauIncomeData[];
}

function dedupeTasksById(tasks: Task[]): Task[] {
  const seenIds = new Set<string>();

  return tasks.filter(task => {
    if (!task.id || seenIds.has(task.id)) {
      return false;
    }

    seenIds.add(task.id);
    return true;
  });
}

export function useHsIncomeReport(
  listId: string,
  preasbuiltSearchParams: SearchParams | null,
  designSearchParams: SearchParams | null,
  redesignSearchParams: SearchParams | null
): UseHsIncomeReportReturn {
  const { clickUpTasks: preasbuiltClickUpTasks } = useFetchClickUpTasks(listId, preasbuiltSearchParams);
  const { clickUpTasks: designClickUpTasks } = useFetchClickUpTasks(listId, designSearchParams);
  const { clickUpTasks: redesignClickUpTasks } = useFetchClickUpTasks(listId, redesignSearchParams);

  const dedupedPreasbuiltTasks = useMemo(
    () => dedupeTasksById(preasbuiltClickUpTasks),
    [preasbuiltClickUpTasks]
  );
  const dedupedDesignTasks = useMemo(() => dedupeTasksById(designClickUpTasks), [designClickUpTasks]);
  const dedupedRedesignTasks = useMemo(
    () => dedupeTasksById(redesignClickUpTasks),
    [redesignClickUpTasks]
  );

  const formattedTasks = useMemo(
    () => [
      ...formatApprovedHsTasks(dedupedPreasbuiltTasks, 'preasbuilt'),
      ...formatApprovedHsTasks(dedupedDesignTasks, 'design'),
      ...formatApprovedHsTasks(dedupedRedesignTasks, 'redesign'),
    ],
    [dedupedPreasbuiltTasks, dedupedDesignTasks, dedupedRedesignTasks]
  );

  const incomeData = useMemo(
    () => formatHsIncomeDataForExcel(formattedTasks, hsPrices),
    [formattedTasks]
  );

  return {
    rawPreasbuiltTasks: preasbuiltClickUpTasks,
    rawDesignTasks: designClickUpTasks,
    rawRedesignTasks: redesignClickUpTasks,
    formattedTasks,
    incomeData,
  };
}
