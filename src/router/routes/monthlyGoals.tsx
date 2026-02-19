import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { appPaths, routeSegments } from '../paths';

const MonthlyGoals = lazy(() => import('../../pages/MonthlyGoals/MonthlyGoals'));

export const monthlyGoalsRoute: RouteObject = {
  id: 'monthly-goals',
  path: routeSegments.monthlyGoals,
  Component: MonthlyGoals,
  handle: {
    title: 'Monthly Goals',
    navKey: appPaths.monthlyGoals,
  },
};
