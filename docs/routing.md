# Routing Architecture Guide

This document walks through the routing setup introduced in the new React Router v7 implementation and describes how to extend it with additional routes while keeping the codebase maintainable.

---

## Overview

- `src/router/index.tsx` creates the shared router singleton with `createBrowserRouter`.
- `src/router/routes/root.tsx` defines the root route that renders the layout, error boundary, and attaches all child routes.
- `src/router/components/RootLayout.tsx` provides global Shell UI (header, layout, suspense fallback, scroll restoration).
- `src/router/components/RouteErrorBoundary.tsx` shows consistent error states when loaders/actions throw or a route is missing.
- `src/router/routes/` contains route modules, one per feature area, each exporting a `RouteObject` (or array) so the tree stays composable.
- `src/router/paths.ts` centralises absolute paths, relative segments, and navigation helpers such as `deriveNavigationKey`.
- `src/pages/NotFound/NotFound.tsx` is wired as the catch-all `*` route so unknown URLs get a friendly message.

The application entry (`src/App.tsx`) simply renders:

```tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  return <RouterProvider router={router} />;
}
```

All routing logic therefore lives under `src/router/`.

---

## Key Building Blocks

### `router/index.tsx`

```tsx
import { createBrowserRouter } from "react-router-dom";
import { rootRoute } from "./routes/root";

export const router = createBrowserRouter([rootRoute]);
```

- Creates a single `router` instance with the full route configuration.
- Exported for use by `<RouterProvider>` at the top of the app as well as for possible testing helpers (`renderWithRouter` patterns).

### `routes/root.tsx`

```tsx
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
```

- `path: "/"` ensures all child route segments render within the shared layout.
- `Component: RootLayout` yields a global header and suspense boundary, keeping UI consistent.
- `errorElement` renders when loaders/actions throw, or when a child route explicitly calls `throw`.
- `children` merges feature route modules produced in `routes/index.ts`.

### `routes/index.ts`

```tsx
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
```

- Exports a single array so `rootRoute` can stay small.
- `taskSyncRoutes` exports an array (supports index + path variants).
- `notFoundRoute` is appended last; it matches any unmatched path.

### Feature Route Modules

Each file under `src/router/routes/` follows a similar pattern:

```tsx
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
```

Highlights:

- Components are lazy-loaded so the bundle stays light. The nearest `<Suspense>` fallback (from `RootLayout`) displays while modules load.
- `handle` metadata carries loose information (here: page title and navigation key). Any component can read it via `useMatches()` or `useRouteLoaderData()`.
- Index route + explicit segment allow `/` and `/task-sync` to share UI.

`mqmsRoutes` additionally nests children for `/mqms-verification`, demonstrating how nested route objects render into `Outlet` inside the parent page.

### `RootLayout`

```tsx
function RootLayout() {
  return (
    <Flex>
      <Layout style={layoutStyle}>
        <HeaderComponent />
        <Content style={contentStyle}>
          <Suspense fallback={<Spin />}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
      <ScrollRestoration />
    </Flex>
  );
}
```

- Wraps every page in a consistent layout, keeping header/spacing centralised.
- Suspense boundary handles lazy route components.
- `ScrollRestoration` restores scroll position when navigating backward/forward (mirrors browser behaviour).

### `RouteErrorBoundary`

```tsx
function RouteErrorBoundary() {
  const navigate = useNavigate();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const status: ResultStatusType = error.status === 404 ? "404" : …;
    return (
      <Result
        status={status}
        title={error.status}
        subTitle={error.statusText || "Se produjo un error inesperado."}
        extra={<Button onClick={() => navigate(-1)}>Volver</Button>}
      />
    );
  }

  const message =
    error instanceof Error ? error.message : "Se produjo un error inesperado.";

  return (
    <Result
      status="error"
      title="Algo salió mal"
      subTitle={message}
      extra={<Button onClick={() => navigate(-1)}>Volver</Button>}
    />
  );
}
```

- Handles both `Response`-style errors from loaders/actions and generic thrown errors.
- Provides a “go back” button so users can recover.

### `paths.ts` and `deriveNavigationKey`

```ts
export const appPaths = {
  root: "/",
  taskSync: "/task-sync",
  vendorProduction: "/production-contratistas",
  incomeReports: "/income-reports",
  mqmsVerification: {
    root: "/mqms-verification",
    checkApproved: "/mqms-verification/check-approved-tasks",
    timetracking: "/mqms-verification/timetracking",
  },
} as const;

export const routeSegments = {
  taskSync: "task-sync",
  vendorProduction: "production-contratistas",
  incomeReports: "income-reports",
  mqmsVerification: {
    root: "mqms-verification",
    checkApproved: "check-approved-tasks",
    timetracking: "timetracking",
  },
} as const;

export type NavigationKey =
  | typeof appPaths.root
  | typeof appPaths.taskSync
  | typeof appPaths.vendorProduction
  | typeof appPaths.incomeReports
  | typeof appPaths.mqmsVerification.root;

export function deriveNavigationKey(pathname: string): NavigationKey | null {
  if (pathname === appPaths.root) return appPaths.root;
  if (pathname.startsWith(appPaths.taskSync)) return appPaths.taskSync;
  if (pathname.startsWith(appPaths.vendorProduction)) return appPaths.vendorProduction;
  if (pathname.startsWith(appPaths.incomeReports)) return appPaths.incomeReports;
  if (pathname.startsWith(appPaths.mqmsVerification.root)) return appPaths.mqmsVerification.root;
  return null;
}
```

- `appPaths`: canonical absolute URLs used throughout the app (links, navigation).
- `routeSegments`: relative segments for router definitions (avoids repeating literal strings).
- `deriveNavigationKey`: inspects the current `pathname` and returns the top-level navigation key for the header menu.
  - Called inside `HeaderComponent` via `selectedKeys={selectedKey ? [selectedKey] : []}`.
  - Ensures nested paths (`/mqms-verification/check-approved-tasks`) still highlight the “MQMS” menu entry.
  - Returns `null` when the path is outside the known sections (e.g., on the 404 page).

### `HeaderComponent`

- Uses `Menu` items keyed by `appPaths`.
- Reads `selectedKey` from `deriveNavigationKey`.
- Keeps nav state in sync without duplicating hard-coded path logic.

### `MqmsVerificationSelector`

- Reads the location and derives the selected sub-feature based on `pathname`.
- Uses `navigate(e.target.value, { relative: "path" })` to remain in the same `/mqms-verification` branch while switching nested routes.
- `Outlet` always renders, so nested routes mount immediately when a URL is pre-loaded.

---

## Adding a New Route

Example: adding a “Reports Dashboard” page at `/reports`.

1. **Create the page component** under `src/pages/Reports/ReportsDashboard.tsx`.
2. **Add route constants** in `paths.ts`:

   ```ts
   export const appPaths = {
     // …
     reports: "/reports" as const,
   };

   export const routeSegments = {
     // …
     reports: "reports" as const,
   };
   ```

   Update the `NavigationKey` union and `deriveNavigationKey` to handle the new path.

3. **Create a route module** at `src/router/routes/reports.tsx`:

   ```tsx
   import { lazy } from "react";
   import type { RouteObject } from "react-router-dom";
   import { appPaths, routeSegments } from "../paths";

   const ReportsDashboard = lazy(
     () => import("../../pages/Reports/ReportsDashboard"),
   );

   export const reportsRoute: RouteObject = {
     id: "reports",
     path: routeSegments.reports,
     Component: ReportsDashboard,
     handle: {
       title: "Reports Dashboard",
       navKey: appPaths.reports,
     },
   };
   ```

4. **Register the route** by importing and appending it inside `routes/index.ts`:

   ```ts
   import { reportsRoute } from "./reports";

   export const childRoutes: RouteObject[] = [
     // existing routes…
     reportsRoute,
     notFoundRoute,
   ];
   ```

5. **Update navigation** to include the new menu item in `HeaderComponent`.

6. **Optional**: add loaders, actions, or nested children if the feature needs data fetching or sub-pages. Because routes are modular, the new file can export additional objects or arrays as needed without bloating existing modules.

This approach ensures routes stay under ~100 lines and remain discoverable by feature.

---

## Testing Tips

- For unit tests, render components with `<RouterProvider router={router}>` or create a test-only router using `createMemoryRouter(childRoutes)`.
- When testing error states, throw from a loader in the test route and assert that `RouteErrorBoundary` renders.
- Use `router.navigate("/mqms-verification/timetracking")` in integration tests to confirm nested routes resolve correctly.

---

## Future Enhancements

- Migrate page-level data fetching into route `loader` and `action` functions for better caching and error handling.
- Attach `handle.breadcrumb` data to routes and build a top-level breadcrumb component via `useMatches`.
- Leverage `router.prefetch` and `<ViewTransition>` once the app targets React Router future flags.

By keeping each route module focused and leveraging centralised path constants, adding new routes or restructuring the tree stays controlled and predictable.

