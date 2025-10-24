import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const NotFound = lazy(() => import("../../pages/NotFound/NotFound"));

export const notFoundRoute: RouteObject = {
  id: "not-found",
  path: "*",
  Component: NotFound,
};

