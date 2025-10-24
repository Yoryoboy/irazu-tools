import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { appPaths, routeSegments } from "../paths";

const IncomeReports = lazy(
  () => import("../../pages/IncomeReports/IncomeReports"),
);

export const incomeReportsRoute: RouteObject = {
  id: "income-reports",
  path: routeSegments.incomeReports,
  Component: IncomeReports,
  handle: {
    title: "Income Reports",
    navKey: appPaths.incomeReports,
  },
};

