import { useMemo } from 'react';
import { useFetchClickUpTasks } from '../../../hooks/useClickUp';
import { Task } from '../../../types/Task';
import { CLICKUP_LIST_IDS } from '../../../utils/config';
import { MonthGoalsConfig } from '../MonthlyGoals.types';
import { computeHsSummary, parseHsGoalTasks } from './HsGoals.helpers';
import { getHsGoalsSearchParams } from './HsGoals.SearchParams';

function getTaskIdentity(task: Task): string {
  return task.id ?? task.custom_id ?? task.name;
}

export function useHsGoals(year: number, month: number, monthConfig: MonthGoalsConfig) {
  const searchParams = useMemo(() => getHsGoalsSearchParams(year, month), [year, month]);

  const asbuiltQuery = useFetchClickUpTasks(CLICKUP_LIST_IDS.cciHs, searchParams.asbuilt);
  const designQuery = useFetchClickUpTasks(CLICKUP_LIST_IDS.cciHs, searchParams.design);
  const redesignQuery = useFetchClickUpTasks(CLICKUP_LIST_IDS.cciHs, searchParams.redesign);

  const deduplicatedTasks = useMemo(() => {
    const taskById = new Map<string, Task>();
    const allTasks = [
      ...asbuiltQuery.clickUpTasks,
      ...designQuery.clickUpTasks,
      ...redesignQuery.clickUpTasks,
    ];

    allTasks.forEach(task => {
      const taskIdentity = getTaskIdentity(task);
      taskById.set(taskIdentity, task);
    });

    return Array.from(taskById.values());
  }, [asbuiltQuery.clickUpTasks, designQuery.clickUpTasks, redesignQuery.clickUpTasks]);

  const parsedTasks = useMemo(
    () => parseHsGoalTasks(deduplicatedTasks, year, month),
    [deduplicatedTasks, year, month]
  );

  const summary = useMemo(() => computeHsSummary(parsedTasks, monthConfig), [parsedTasks, monthConfig]);
  const loading = asbuiltQuery.loading || designQuery.loading || redesignQuery.loading;
  const error = asbuiltQuery.error ?? designQuery.error ?? redesignQuery.error;
  const fetchProgress = useMemo(
    () => ({
      totalPagesFetched:
        asbuiltQuery.progress.pagesFetched +
        designQuery.progress.pagesFetched +
        redesignQuery.progress.pagesFetched,
      totalTasksFetched:
        asbuiltQuery.progress.tasksFetched +
        designQuery.progress.tasksFetched +
        redesignQuery.progress.tasksFetched,
      sources: [
        {
          key: 'asbuilt',
          label: 'Asbuilt completion date',
          loading: asbuiltQuery.loading,
          pagesFetched: asbuiltQuery.progress.pagesFetched,
          tasksFetched: asbuiltQuery.progress.tasksFetched,
        },
        {
          key: 'design',
          label: 'Design completion date',
          loading: designQuery.loading,
          pagesFetched: designQuery.progress.pagesFetched,
          tasksFetched: designQuery.progress.tasksFetched,
        },
        {
          key: 'redesign',
          label: 'Redesign completion date',
          loading: redesignQuery.loading,
          pagesFetched: redesignQuery.progress.pagesFetched,
          tasksFetched: redesignQuery.progress.tasksFetched,
        },
      ] as const,
    }),
    [
      asbuiltQuery.loading,
      asbuiltQuery.progress.pagesFetched,
      asbuiltQuery.progress.tasksFetched,
      designQuery.loading,
      designQuery.progress.pagesFetched,
      designQuery.progress.tasksFetched,
      redesignQuery.loading,
      redesignQuery.progress.pagesFetched,
      redesignQuery.progress.tasksFetched,
    ]
  );

  return {
    summary,
    loading,
    error,
    fetchProgress,
    rawTasks: deduplicatedTasks,
  };
}
