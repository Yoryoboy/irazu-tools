import { useMemo } from 'react';
import { useFetchClickUpTasks } from '../../../hooks/useClickUp';
import { CLICKUP_LIST_IDS } from '../../../utils/config';
import { MonthGoalsConfig } from '../MonthlyGoals.types';
import { computeHsSummary, parseHsGoalTasks } from './HsGoals.helpers';
import { getHsGoalsSearchParams } from './HsGoals.SearchParams';

export function useHsGoals(year: number, month: number, monthConfig: MonthGoalsConfig) {
  const searchParams = useMemo(() => getHsGoalsSearchParams(), []);

  const { clickUpTasks, loading, error } = useFetchClickUpTasks(CLICKUP_LIST_IDS.cciHs, searchParams);

  const parsedTasks = useMemo(() => parseHsGoalTasks(clickUpTasks, year, month), [clickUpTasks, year, month]);

  const summary = useMemo(() => computeHsSummary(parsedTasks, monthConfig), [parsedTasks, monthConfig]);

  return {
    summary,
    loading,
    error,
    rawTasks: clickUpTasks,
  };
}
