import type { RouteObject } from "react-router-dom";
import { incomeReportsRoute } from "./incomeReports";
import { mqmsRoutes } from "./mqmsVerification";
import { notFoundRoute } from "./notFound";
import { taskSyncRoutes } from "./taskSync";
import { vendorProductionRoute } from "./vendorProduction";

export const childRoutes: RouteObject[] = [
  ...taskSyncRoutes,
  vendorProductionRoute,
  mqmsRoutes,
  incomeReportsRoute,
  notFoundRoute,
];

