import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { appPaths, routeSegments } from "../paths";

const VendorProduction = lazy(
  () => import("../../pages/VendorProduction/VendorProduction"),
);

export const vendorProductionRoute: RouteObject = {
  id: "vendor-production",
  path: routeSegments.vendorProduction,
  Component: VendorProduction,
  handle: {
    title: "Producción de Contratistas",
    navKey: appPaths.vendorProduction,
  },
};

