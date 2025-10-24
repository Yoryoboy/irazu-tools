import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { appPaths, routeSegments } from "../paths";

const TaskSyncListSelector = lazy(
  () => import("../../pages/TaskSync/TaskSyncListSelector"),
);

export const taskSyncRoutes: RouteObject[] = [
  {
    id: "task-sync-index",
    index: true,
    Component: TaskSyncListSelector,
    handle: {
      title: "Task Sync",
      navKey: appPaths.taskSync,
    },
  },
  {
    id: "task-sync",
    path: routeSegments.taskSync,
    Component: TaskSyncListSelector,
    handle: {
      title: "Task Sync",
      navKey: appPaths.taskSync,
    },
  },
];

