# Monthly Goals Dashboard — Implementation Plan

## Overview

New page at `src/pages/MonthlyGoals/` that provides a dashboard to track whether the team has met monthly production goals. Tracks **designers** (via `assignees`) and **QC reviewers** (via custom field `QC PERFORMED BY`). Starts with **BAU** project; HS will be added later.

---

## Key Data Points (from ClickUp tasks)

| Field | Source | Type | Purpose |
|---|---|---|---|
| **ACTUAL COMPLETION DATE** | Custom field (date) | `string` (epoch ms) | Determines which month a task belongs to |
| **DESIGN POINTS** | Custom field (number) | `number` | Points earned per task |
| **assignees** | Task field | `User[]` | Designer who completed the task |
| **QC PERFORMED BY** | Custom field (users) | `User[]` | QC reviewer of the task |

If any of these fields are missing on a task, show a **Sileo warning toast** — but never break the flow.

---

## Prerequisites

### 1. Install shadcn/ui

shadcn is **not yet configured** in this project. It needs to be set up first.

1. Run `pnpm dlx shadcn@latest init`
   - Framework: **Vite + React**
   - Style: **Default**
   - Base color: pick one that matches the existing dark header (e.g., Zinc or Slate)
   - CSS variables: **Yes**
   - Tailwind CSS: already installed (v4), ensure `components.json` points to correct paths
2. This will create:
   - `components.json` at project root
   - `src/components/ui/` directory
   - Possibly update `tailwind.config` / `index.css` with CSS variables
3. Install needed shadcn components:
   ```bash
   pnpm dlx shadcn@latest add card tabs select progress badge table
   ```

### 2. Install Sileo

```bash
pnpm add sileo
```

### 3. Add `<Toaster />` to root layout

Edit `src/router/components/RootLayout.tsx`:
```tsx
import { Toaster } from "sileo";

// Inside the JSX, after <ScrollRestoration />:
<Toaster position="bottom-right" />
```

---

## File Structure

```
src/pages/MonthlyGoals/
├── MonthlyGoals.tsx                  # Main page component (tab layout: BAU | HS)
├── MonthlyGoals.types.ts            # Types for dashboard data
├── MonthlyGoals.constants.ts        # Monthly goals targets, field names
├── BauGoals/
│   ├── BauGoals.tsx                  # BAU tab content
│   ├── BauGoals.hooks.ts            # useBauGoals hook
│   ├── BauGoals.helpers.ts          # Data transformation & validation
│   └── BauGoals.SearchParams.ts     # ClickUp search params for BAU goals
├── components/
│   ├── GoalProgressCard.tsx          # Reusable card: shows metric + progress bar
│   ├── MemberPerformanceTable.tsx    # Table: member name, points, task count
│   └── MonthSelector.tsx            # Month/year picker component
```

---

## Step-by-step Implementation

### Step 1 — Types (`MonthlyGoals.types.ts`)

```ts
export interface MonthlyGoalTask {
  id: string;
  name: string;
  completionDate: Date | null;       // parsed from "ACTUAL COMPLETION DATE"
  designPoints: number | null;        // from "DESIGN POINTS"
  designer: string | null;            // from assignees[0].username
  designerId: number | null;          // from assignees[0].id
  qcPerformedBy: string | null;      // from "QC PERFORMED BY" user field
  qcPerformedById: number | null;
  warnings: string[];                 // list of missing fields
}

export interface MemberPerformance {
  memberId: number;
  memberName: string;
  totalPoints: number;
  taskCount: number;
}

export interface MonthlyGoalsSummary {
  totalTasks: number;
  totalDesignPoints: number;
  designerPerformance: MemberPerformance[];
  qcPerformance: MemberPerformance[];
  tasksWithWarnings: MonthlyGoalTask[];
}
```

### Step 2 — Constants (`MonthlyGoals.constants.ts`)

Define:
- Monthly point targets (can be a simple object or configurable later)
- Custom field names as constants:
  ```ts
  export const FIELD_ACTUAL_COMPLETION_DATE = "ACTUAL COMPLETION DATE";
  export const FIELD_DESIGN_POINTS = "DESIGN POINTS";
  export const FIELD_QC_PERFORMED_BY = "QC PERFORMED BY";
  ```

### Step 3 — Search Params (`BauGoals.SearchParams.ts`)

Build ClickUp search params to fetch tasks from the BAU list (`CLICKUP_LIST_IDS.cciBau = "901404730264"`) filtered by:
- `include_closed: "true"` — to get completed tasks
- **No date filter in the API call** — filter by month client-side using `ACTUAL COMPLETION DATE`, since ClickUp's date custom field filtering is limited

Reuse the existing `useFetchClickUpTasks` hook from `src/hooks/useClickUp.ts` which already handles pagination.

### Step 4 — Helpers (`BauGoals.helpers.ts`)

Functions:
1. **`parseGoalTasks(tasks: Task[]): MonthlyGoalTask[]`**
   - Extract `ACTUAL COMPLETION DATE`, `DESIGN POINTS`, `QC PERFORMED BY`, and `assignees` from each task
   - Build `warnings[]` for any missing field
   - Return parsed array

2. **`filterByMonth(tasks: MonthlyGoalTask[], year: number, month: number): MonthlyGoalTask[]`**
   - Filter tasks where `completionDate` falls in the given month/year

3. **`computeSummary(tasks: MonthlyGoalTask[]): MonthlyGoalsSummary`**
   - Aggregate total points
   - Group by designer → `designerPerformance[]`
   - Group by QC reviewer → `qcPerformance[]`
   - Collect tasks with warnings

4. **`notifyMissingFields(tasks: MonthlyGoalTask[]): void`**
   - For each task with warnings, fire a `sileo.warning()` toast:
     ```ts
     sileo.warning({
       title: `Missing fields on "${task.name}"`,
       description: task.warnings.join(", "),
     });
     ```
   - Limit to a reasonable number (e.g., first 5 tasks), then a summary toast if more exist

### Step 5 — Hook (`BauGoals.hooks.ts`)

```ts
export function useBauGoals(year: number, month: number) {
  // 1. Build search params (reuse pattern from VendorProduction.SearchParams.ts)
  // 2. Call useFetchClickUpTasks(CLICKUP_LIST_IDS.cciBau, searchParams)
  // 3. useMemo → parseGoalTasks → filterByMonth → computeSummary
  // 4. useEffect → notifyMissingFields when tasks change
  // Return: { summary, loading, rawTasks }
}
```

### Step 6 — UI Components

#### `MonthSelector.tsx`
- shadcn `Select` for month + year
- Defaults to current month/year
- Returns `{ year, month }` via callback

#### `GoalProgressCard.tsx`
- shadcn `Card` with:
  - Title (e.g., "Total Design Points")
  - Current value / Target value
  - shadcn `Progress` bar (percentage)
  - Color coding: green if >= 100%, yellow if >= 75%, red if < 75%

#### `MemberPerformanceTable.tsx`
- shadcn `Table` with columns:
  - **Member** — name
  - **Tasks** — count
  - **Points** — total design points
- Sorted by points descending
- Used for both designer and QC performance (pass data as prop)

#### `BauGoals.tsx`
Layout:
```
┌─────────────────────────────────────────────┐
│  [MonthSelector]                            │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐         │
│  │ Total Tasks  │  │ Total Points │         │
│  │   45 / 60    │  │  320 / 400   │         │
│  │ ████████░░░  │  │ ██████████░  │         │
│  └──────────────┘  └──────────────┘         │
├─────────────────────────────────────────────┤
│  Designer Performance    │  QC Performance  │
│  ┌────────────────────┐  │ ┌──────────────┐ │
│  │ Name  Tasks Points │  │ │ Name Tasks Pt│ │
│  │ Juan    12    85   │  │ │ Ana   15  90 │ │
│  │ ...                │  │ │ ...          │ │
│  └────────────────────┘  │ └──────────────┘ │
└─────────────────────────────────────────────┘
```

#### `MonthlyGoals.tsx`
- shadcn `Tabs` with two tabs: **BAU** and **HS** (HS disabled/placeholder for now)
- Renders `<BauGoals />` inside the BAU tab

### Step 7 — Routing

1. **`src/router/paths.ts`** — Add:
   ```ts
   monthlyGoals: "/monthly-goals" as const,
   ```
   Update `routeSegments`, `NavigationKey`, and `deriveNavigationKey`.

2. **`src/router/routes/monthlyGoals.tsx`** — New route file:
   ```tsx
   const MonthlyGoals = lazy(() => import("../../pages/MonthlyGoals/MonthlyGoals"));
   export const monthlyGoalsRoute: RouteObject = {
     id: "monthly-goals",
     path: routeSegments.monthlyGoals,
     Component: MonthlyGoals,
     handle: { title: "Monthly Goals", navKey: appPaths.monthlyGoals },
   };
   ```

3. **`src/router/routes/index.ts`** — Add `monthlyGoalsRoute` to `childRoutes`.

4. **`src/components/HeaderComponent.tsx`** — Add nav link for "Monthly Goals".

---

## Important Patterns to Follow

- **Lazy loading**: All page components use `lazy()` + `Suspense` (already in `RootLayout`)
- **Search params pattern**: Follow `VendorProduction.SearchParams.ts` style
- **Hook pattern**: Follow `useBauIncomeReport.ts` — use `useFetchClickUpTasks` + `useMemo`
- **Custom field access**: Use `task.custom_fields?.find(f => f.name === "FIELD_NAME")?.value`
- **Date parsing**: ClickUp stores dates as epoch ms strings → `new Date(Number(value))`
- **User field values**: `QC PERFORMED BY` returns `User[]` array (see `CustomField.value` type)
- **File naming**: `PascalCase` for components, `camelCase` for hooks/helpers, dot-separated for co-located files (e.g., `BauGoals.hooks.ts`)

## Notifications Strategy (Sileo)

- **On data load**: Check each task for missing `ACTUAL COMPLETION DATE`, `DESIGN POINTS`, `assignees`, or `QC PERFORMED BY`
- **Toast type**: `sileo.warning()` for missing fields
- **Batching**: If > 5 tasks have warnings, show first 5 individually + 1 summary toast: `"X more tasks have missing fields"`
- **No blocking**: Missing fields should result in `null` values in the parsed data, not errors. Tasks with missing completion dates are simply excluded from the month filter.

## HS (Future — Not in Scope Now)

- Will use `CLICKUP_LIST_IDS.cciHs = "900200859937"`
- Same custom fields apply
- Will be added as a second tab in `MonthlyGoals.tsx`
- Separate `HsGoals/` folder following the same structure as `BauGoals/`
