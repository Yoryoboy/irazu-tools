import type { RouteObject } from "react-router-dom";
import { DESIGNER_VIEW } from "../../utils/config";
import { incomeReportsRoute } from "./incomeReports";
import { mqmsRoutes } from "./mqmsVerification";
import { notFoundRoute } from "./notFound";
import { taskSyncRoutes } from "./taskSync";
import { vendorProductionRoute } from "./vendorProduction";

export const childRoutes: RouteObject[] = [
  ...taskSyncRoutes,
  ...(DESIGNER_VIEW ? [] : [vendorProductionRoute]),
  mqmsRoutes,
  ...(DESIGNER_VIEW ? [] : [incomeReportsRoute]),
  notFoundRoute,
];
