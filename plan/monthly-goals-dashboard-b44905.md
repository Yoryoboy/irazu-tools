# Monthly Goals Dashboard — Final Implementation Plan

A dashboard page at `src/pages/MonthlyGoals/` to track monthly production goals for designers and QC reviewers, starting with BAU project, using data from ClickUp tasks.

---

## Prerequisites

### 1. Install shadcn/ui
```bash
pnpm dlx shadcn@latest init  # Vite + React, Default style, Zinc base, CSS variables: Yes
pnpm dlx shadcn@latest add card tabs select progress badge table dialog input label separator tooltip
```

### 2. Install Sileo + dayjs timezone
```bash
pnpm add sileo
pnpm add dayjs  # already installed, but ensure timezone plugin is available
```

### 3. Add `<Toaster />` to `src/router/components/RootLayout.tsx`
```tsx
import { Toaster } from "sileo";
// After <ScrollRestoration />:
<Toaster position="bottom-right" />
```

### 4. Extend `useFetchClickUpTasks` hook
Add `loading` and `error` to the return value of `src/hooks/useClickUp.ts`. Existing consumers that only destructure `{ clickUpTasks }` remain unaffected.
```ts
// Return type becomes:
{ clickUpTasks: Task[], loading: boolean, error: Error | null }
```

---

## Key Decisions (from review discussion)

| Topic | Decision |
|---|---|
| **Date filtering** | Use ClickUp API `RANGE` operator on `ACTUAL COMPLETION DATE` (same as `IncomeReports.handlers.ts`), filter by `'statuses[]': ['approved', 'sent']` |
| **Multiple assignees** | Split `DESIGN POINTS` proportionally among all assignees. Decimals are acceptable. Same for QC reviewers. UI must clearly explain this behavior. |
| **DESIGN POINTS = 0** | Valid value. Only `null`/`undefined` triggers a warning. |
| **Timezone** | Use `America/Argentina/Buenos_Aires` via `dayjs` timezone plugin for all date operations |
| **Missing field notifications** | No auto-firing toasts. Instead, a "Show Warnings" button that reveals an expandable section listing tasks with incomplete data |
| **Monthly goals** | Per-month configurable targets stored in localStorage. Default goal for designers + QC, with per-member overrides. Export/import config as JSON. |
| **Initial state** | Auto-select current month on load. Show a subtle indicator so user knows which month is selected. |
| **Page visibility** | Admin-only, gated behind `!DESIGNER_VIEW` |
| **React Query** | Not now. Extend existing hook instead. Adopt RQ later during full shadcn migration. |

---

## File Structure

```
src/pages/MonthlyGoals/
├── MonthlyGoals.tsx                  # Main page (Tabs: BAU | HS placeholder)
├── MonthlyGoals.types.ts            # All types
├── MonthlyGoals.constants.ts        # Field name constants
├── BauGoals/
│   ├── BauGoals.tsx                  # BAU tab content
│   ├── BauGoals.hooks.ts            # useBauGoals hook
│   ├── BauGoals.helpers.ts          # Data transformation, validation, point splitting
│   └── BauGoals.SearchParams.ts     # ClickUp RANGE search params builder
├── components/
│   ├── GoalProgressCard.tsx          # Card with progress bar + color coding
│   ├── MemberPerformanceTable.tsx    # Table: member, tasks, points, goal, progress
│   ├── MonthSelector.tsx             # Month/year selector, defaults to current month
│   ├── GoalsConfigDialog.tsx         # Dialog to configure monthly goals
│   ├── WarningsPanel.tsx             # Expandable section for tasks with missing fields
│   └── ExportImportConfig.tsx        # Export/import goals config as JSON
├── hooks/
│   └── useGoalsConfig.ts            # localStorage read/write hook for goals config
```

---

## Step-by-step Implementation

### Step 1 — Extend `useFetchClickUpTasks` (`src/hooks/useClickUp.ts`)

Add `loading` and `error` state. Return `{ clickUpTasks, loading, error }`. No changes to existing consumers needed.

### Step 2 — Types (`MonthlyGoals.types.ts`)

```ts
export interface MonthlyGoalTask {
  id: string;
  name: string;
  completionDate: Date | null;
  designPoints: number | null;
  designers: MemberShare[];          // ALL assignees with proportional points
  qcReviewers: MemberShare[];        // ALL QC users with proportional points
  warnings: string[];
}

export interface MemberShare {
  memberId: number;
  memberName: string;
  points: number;                    // proportional share of designPoints
}

export interface MemberPerformance {
  memberId: number;
  memberName: string;
  totalPoints: number;
  taskCount: number;
  goal: number;                      // from config (custom or default)
  progressPercent: number;
}

export interface MonthlyGoalsSummary {
  totalTasks: number;
  totalDesignPoints: number;
  designerPerformance: MemberPerformance[];
  qcPerformance: MemberPerformance[];
  tasksWithWarnings: MonthlyGoalTask[];
}

// Goals config stored in localStorage
export interface GoalsConfig {
  [monthKey: string]: MonthGoalsConfig;  // key format: "2026-02"
}

export interface MonthGoalsConfig {
  defaultDesignerGoal: number;
  defaultQcGoal: number;
  memberOverrides: Record<number, {     // keyed by memberId
    designerGoal?: number;
    qcGoal?: number;
  }>;
}
```

### Step 3 — Constants (`MonthlyGoals.constants.ts`)

```ts
export const FIELD_ACTUAL_COMPLETION_DATE = "ACTUAL COMPLETION DATE";
export const FIELD_DESIGN_POINTS = "DESIGN POINTS";
export const FIELD_QC_PERFORMED_BY = "QC PERFORMED BY";
export const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";
export const GOALS_STORAGE_KEY = "irazu-monthly-goals-config";
export const DEFAULT_DESIGNER_GOAL = 400;
export const DEFAULT_QC_GOAL = 400;
```

### Step 4 — Goals Config Hook (`hooks/useGoalsConfig.ts`)

- Read/write `GoalsConfig` from localStorage under key `irazu-monthly-goals-config`
- Provide `getMonthConfig(monthKey)` → returns config for that month, falling back to defaults
- Provide `setMonthConfig(monthKey, config)` → saves
- Provide `exportConfig()` → downloads JSON file
- Provide `importConfig(file)` → reads JSON, validates shape, merges into localStorage
- If a month has no config yet, use `DEFAULT_DESIGNER_GOAL` / `DEFAULT_QC_GOAL` as starting values

### Step 5 — Search Params (`BauGoals.SearchParams.ts`)

Use `RANGE` operator on `ACTUAL COMPLETION DATE`, same pattern as `IncomeReports.handlers.ts`:
```ts
export function getBauGoalsSearchParams(year: number, month: number): SearchParams {
  const fieldId = getCustomField("ACTUAL COMPLETION DATE", "bau").id;
  const start = dayjs.tz(`${year}-${month}-01`, ARGENTINA_TZ).startOf("month");
  const end = start.endOf("month");

  return {
    "statuses[]": ["approved", "sent"],
    include_closed: "true",
    custom_fields: JSON.stringify([{
      field_id: fieldId,
      operator: "RANGE",
      value: [start.valueOf(), end.valueOf()],
    }]),
  };
}
```

### Step 6 — Helpers (`BauGoals.helpers.ts`)

1. **`parseGoalTasks(tasks: Task[]): MonthlyGoalTask[]`**
   - Extract fields, build `warnings[]` for missing `ACTUAL COMPLETION DATE`, `DESIGN POINTS` (null/undefined only, 0 is valid), `assignees`, `QC PERFORMED BY`
   - Split `designPoints` proportionally among all assignees → `designers: MemberShare[]`
   - Split `designPoints` proportionally among all QC reviewers → `qcReviewers: MemberShare[]`
   - Use `dayjs.tz(..., ARGENTINA_TZ)` for date parsing

2. **`computeSummary(tasks: MonthlyGoalTask[], config: MonthGoalsConfig): MonthlyGoalsSummary`**
   - Aggregate points per member (sum their proportional shares across tasks)
   - Look up each member's goal from `config.memberOverrides[id]` or fall back to `config.defaultDesignerGoal` / `config.defaultQcGoal`
   - Compute `progressPercent` per member
   - Collect `tasksWithWarnings`

### Step 7 — Hook (`BauGoals.hooks.ts`)

```ts
export function useBauGoals(year: number, month: number) {
  const searchParams = useMemo(() => getBauGoalsSearchParams(year, month), [year, month]);
  const { clickUpTasks, loading, error } = useFetchClickUpTasks(CLICKUP_LIST_IDS.cciBau, searchParams);
  const { getMonthConfig } = useGoalsConfig();
  const config = getMonthConfig(`${year}-${String(month).padStart(2, "0")}`);

  const parsedTasks = useMemo(() => parseGoalTasks(clickUpTasks), [clickUpTasks]);
  const summary = useMemo(() => computeSummary(parsedTasks, config), [parsedTasks, config]);

  return { summary, loading, error, rawTasks: clickUpTasks };
}
```

### Step 8 — UI Components

#### `MonthSelector.tsx`
- Two shadcn `Select` dropdowns: month + year
- Auto-selects current month/year on mount
- Subtle badge or text: "Showing: February 2026"

#### `GoalProgressCard.tsx`
- shadcn `Card`: title, current/target, `Progress` bar
- Color: green ≥100%, yellow ≥75%, red <75%

#### `MemberPerformanceTable.tsx`
- shadcn `Table` columns: **Member**, **Tasks**, **Points**, **Goal**, **Progress**
- Progress column shows a mini progress bar or percentage badge
- Sorted by points descending
- Tooltip on points: "Points split proportionally among N assignees"
- Used for both designer and QC tables (pass data + title as props)

#### `GoalsConfigDialog.tsx`
- Triggered by a ⚙️ gear icon button
- shadcn `Dialog` with:
  - **Default goals** section: two `Input` fields (Designer Goal, QC Goal)
  - **Member overrides** section: table of known members (auto-populated from fetched data). Each row has optional custom goal inputs. Empty = use default.
  - Save button persists to localStorage for the selected month
- Shows which month the config applies to

#### `ExportImportConfig.tsx`
- Two buttons inside the config dialog:
  - **Export**: downloads full `GoalsConfig` as `irazu-goals-config.json`
  - **Import**: file picker, validates JSON shape, merges into localStorage

#### `WarningsPanel.tsx`
- Collapsed by default. "⚠ X tasks have missing fields" button to expand.
- Expanded: list of task names + which fields are missing
- No auto-firing toasts. User-initiated only.

#### `BauGoals.tsx`
```
┌──────────────────────────────────────────────────────┐
│  [MonthSelector]                        [⚙️ Config]  │
├──────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ Total Tasks  │  │ Total Points │                  │
│  │   45 / 60    │  │  320 / 400   │                  │
│  │ ████████░░░  │  │ ██████████░  │                  │
│  └──────────────┘  └──────────────┘                  │
├──────────────────────────────────────────────────────┤
│  Designer Performance        │  QC Performance       │
│  ┌────────────────────────┐  │ ┌──────────────────┐  │
│  │ Name Tasks Pts Goal  % │  │ │ Name Tasks Pts % │  │
│  │ Juan   12  85  100  85%│  │ │ Ana   15  90  90%│  │
│  │ ...                    │  │ │ ...              │  │
│  └────────────────────────┘  │ └──────────────────┘  │
├──────────────────────────────────────────────────────┤
│  [⚠ 3 tasks have missing fields]  (expandable)      │
└──────────────────────────────────────────────────────┘
```

#### `MonthlyGoals.tsx`
- shadcn `Tabs`: **BAU** (active) | **HS** (disabled placeholder)
- Renders `<BauGoals />`

### Step 9 — Routing

1. **`src/router/paths.ts`** — Add `monthlyGoals: "/monthly-goals"` to `appPaths` and `routeSegments`. Update `NavigationKey` and `deriveNavigationKey` (guarded with `!DESIGNER_VIEW`).

2. **`src/router/routes/monthlyGoals.tsx`** — New lazy route file.

3. **`src/router/routes/index.ts`** — Add: `...(DESIGNER_VIEW ? [] : [monthlyGoalsRoute])`

4. **`src/components/HeaderComponent.tsx`** — Add "Monthly Goals" link inside `if (!DESIGNER_VIEW)` block.

---

## Important Patterns

- **Lazy loading**: All pages use `lazy()` + `Suspense` (already in RootLayout)
- **Search params**: Follow `IncomeReports.handlers.ts` pattern with `RANGE` operator
- **Hook pattern**: `useFetchClickUpTasks` + `useMemo` (like `useBauIncomeReport.ts`)
- **Custom field access**: `task.custom_fields?.find(f => f.name === NAME)?.value`
- **Date parsing**: epoch ms → `dayjs.tz(Number(value), ARGENTINA_TZ)`
- **User field values**: `QC PERFORMED BY` returns `User[]` array
- **File naming**: PascalCase components, camelCase hooks/helpers, dot-separated co-located files
- **Point splitting**: `designPoints / assignees.length` per member. Clearly communicated in UI via tooltip.

---

## Page Visibility

Gated behind `!DESIGNER_VIEW` in three places:
1. `src/router/routes/index.ts` — conditional route inclusion
2. `src/components/HeaderComponent.tsx` — nav link in `!DESIGNER_VIEW` block
3. `src/router/paths.ts` — `deriveNavigationKey` guard

---

## Agent Instructions: Documentation Lookup

When implementing this plan, **always use available tools to find up-to-date documentation** before writing code for any library:

1. **Context7 MCP** — Use `resolve-library-id` then `query-docs` for any library (shadcn/ui, dayjs, react-router-dom, tailwindcss, etc.). This is the preferred first source.
2. **Web fetch** — For libraries not indexed in Context7 (e.g., **Sileo**), fetch docs directly:
   - Sileo getting started: `https://sileo.aaryan.design/docs`
   - Sileo API reference: `https://sileo.aaryan.design/docs/api`
   - Sileo Toaster config: `https://sileo.aaryan.design/docs/api/toaster`
   - Sileo styling: `https://sileo.aaryan.design/docs/styling`
3. **Do not guess** API signatures, component props, or configuration options. Look them up first.

---

## HS (Future — Not in Scope)

- Uses `CLICKUP_LIST_IDS.cciHs`
- Same fields, same structure
- Separate `HsGoals/` folder, enabled as second tab
