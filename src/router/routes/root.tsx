import type { RouteObject } from "react-router-dom";
import RootLayout from "../components/RootLayout";
import RouteErrorBoundary from "../components/RouteErrorBoundary";
import { appPaths } from "../paths";
import { childRoutes } from "./index";

export const rootRoute: RouteObject = {
  id: "root",
  path: appPaths.root,
  Component: RootLayout,
  errorElement: <RouteErrorBoundary />,
  children: childRoutes,
};

