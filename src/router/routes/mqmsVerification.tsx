import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { appPaths, routeSegments } from "../paths";

const MqmsVerificationSelector = lazy(
  () => import("../../pages/MqmsVerification/MqmsVerificationSelector"),
);

const MqmsListConfigForCheckApproved = lazy(
  () =>
    import(
      "../../pages/MqmsVerification/MqmsListConfigForCheckApproved"
    ),
);

const MqmsTimetracking = lazy(
  () =>
    import(
      "../../pages/MqmsVerification/SyncTimetracking/MqmsTimetracking"
    ),
);

export const mqmsRoutes: RouteObject = {
  id: "mqms",
  path: routeSegments.mqmsVerification.root,
  Component: MqmsVerificationSelector,
  handle: {
    title: "MQMS",
    navKey: appPaths.mqmsVerification.root,
  },
  children: [
    {
      id: "mqms-check-approved",
      path: routeSegments.mqmsVerification.checkApproved,
      Component: MqmsListConfigForCheckApproved,
      handle: {
        title: "Check Approved Tasks",
        navKey: appPaths.mqmsVerification.root,
      },
    },
    {
      id: "mqms-timetracking",
      path: routeSegments.mqmsVerification.timetracking,
      Component: MqmsTimetracking,
      handle: {
        title: "Sync Timetracking",
        navKey: appPaths.mqmsVerification.root,
      },
    },
  ],
};

