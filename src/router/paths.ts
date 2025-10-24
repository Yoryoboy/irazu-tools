import { DESIGNER_VIEW } from "../utils/config";

export const appPaths = {
  root: "/" as const,
  taskSync: "/task-sync" as const,
  vendorProduction: "/production-contratistas" as const,
  incomeReports: "/income-reports" as const,
  mqmsVerification: {
    root: "/mqms-verification" as const,
    checkApproved: "/mqms-verification/check-approved-tasks" as const,
    timetracking: "/mqms-verification/timetracking" as const,
  },
} as const;

export const routeSegments = {
  taskSync: "task-sync" as const,
  vendorProduction: "production-contratistas" as const,
  incomeReports: "income-reports" as const,
  mqmsVerification: {
    root: "mqms-verification" as const,
    checkApproved: "check-approved-tasks" as const,
    timetracking: "timetracking" as const,
  },
} as const;

export type NavigationKey =
  | typeof appPaths.root
  | typeof appPaths.taskSync
  | typeof appPaths.vendorProduction
  | typeof appPaths.incomeReports
  | typeof appPaths.mqmsVerification.root;

export function deriveNavigationKey(pathname: string): NavigationKey | null {
  if (pathname === appPaths.root) {
    return appPaths.root;
  }

  if (pathname.startsWith(appPaths.taskSync)) {
    return appPaths.taskSync;
  }

  if (!DESIGNER_VIEW && pathname.startsWith(appPaths.vendorProduction)) {
    return appPaths.vendorProduction;
  }

  if (!DESIGNER_VIEW && pathname.startsWith(appPaths.incomeReports)) {
    return appPaths.incomeReports;
  }

  if (pathname.startsWith(appPaths.mqmsVerification.root)) {
    return appPaths.mqmsVerification.root;
  }

  return null;
}
