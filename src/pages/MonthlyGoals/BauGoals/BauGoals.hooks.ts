import { useMemo } from 'react';
import { useFetchClickUpTasks } from '../../../hooks/useClickUp';
import { CLICKUP_LIST_IDS } from '../../../utils/config';
import { MonthGoalsConfig } from '../MonthlyGoals.types';
import { computeSummary, parseGoalTasks } from './BauGoals.helpers';
import { getBauGoalsSearchParams } from './BauGoals.SearchParams';

export function useBauGoals(year: number, month: number, monthConfig: MonthGoalsConfig) {
  const searchParams = useMemo(() => getBauGoalsSearchParams(year, month), [year, month]);

  const { clickUpTasks, loading, error } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciBau,
    searchParams
  );

  const parsedTasks = useMemo(() => parseGoalTasks(clickUpTasks), [clickUpTasks]);

  const summary = useMemo(() => computeSummary(parsedTasks, monthConfig), [parsedTasks, monthConfig]);

  return {
    summary,
    loading,
    error,
    rawTasks: clickUpTasks,
  };
}
