# HS Goals Tracker Implementation Plan

Implement the High Split (HS) goal tracker tab in the Monthly Goals dashboard, mirroring the BAU pattern but adapted for HS's three-work-type model (Asbuilt, Design, Redesign) with miles-based metrics instead of design points.

---

## Key Differences: BAU vs HS

| Aspect              | BAU                                      | HS                                                                                                        |
| ------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Metric**          | Design Points (single field)             | Miles (3 separate fields: Asbuilt, Design, Redesign)                                                      |
| **Assignee**        | `task.assignees` (single source)         | Asbuilt/Redesign: `Assignee`, Design: `DESIGN ASSIGNEE` custom field                                      |
| **QC**              | `QC PERFORMED BY` (single field)         | 3 fields: `PREASBUILT QC BY`, `DESIGN QC BY`, `REDESIGN QC BY`                                            |
| **Completion Date** | `ACTUAL COMPLETION DATE` (single)        | 3 dates: `PREASBUILT ACTUAL COMPLETION DATE`, `ACTUAL COMPLETION DATE`, `REDESIGN ACTUAL COMPLETION DATE` |
| **Data fetch**      | Single API call filtered by 1 date field | Must fetch ALL tasks for the month (any of 3 dates could qualify)                                         |
| **ClickUp List**    | `cciBau` (`901404730264`)                | `cciHs` (`900200859937`)                                                                                  |
| **Combined view**   | N/A — single work type                   | Person totals combine miles across all 3 work types                                                       |

---

## Architecture (mirrors BauGoals structure)

```
src/pages/MonthlyGoals/
  HsGoals/
    HsGoals.tsx              # Page component (like BauGoals.tsx)
    HsGoals.hooks.ts         # useHsGoals hook (like BauGoals.hooks.ts)
    HsGoals.helpers.ts       # Parse + compute logic (like BauGoals.helpers.ts)
    HsGoals.SearchParams.ts  # ClickUp search params builder
    HsGoals.constants.ts     # HS-specific field name constants
```

---

## Implementation Steps

### 1. `HsGoals.constants.ts` — HS field name constants

Define constants for all HS-specific custom field names:

- `FIELD_PREASBUILT_COMPLETION_DATE` = `'PREASBUILT ACTUAL COMPLETION DATE '` (note trailing space in ClickUp)
- `FIELD_ACTUAL_COMPLETION_DATE` = `'ACTUAL COMPLETION DATE'` (Design completion)
- `FIELD_REDESIGN_COMPLETION_DATE` = `'REDESIGN ACTUAL COMPLETION DATE'`
- `FIELD_ASBUILT_MILES` = `'ASBUILT MILES'`
- `FIELD_DESIGN_MILES` = `'DESIGN MILES'`
- `FIELD_REDESIGN_MILES` = `'REDESIGN ROUNDED MILES'` ✅
- `FIELD_DESIGN_ASSIGNEE` = `'DESIGN ASSIGNEE'`
- `FIELD_PREASBUILT_QC_BY` = `'PREASBUILT QC BY'`
- `FIELD_DESIGN_QC_BY` = `'DESIGN QC BY'`
- `FIELD_REDESIGN_QC_BY` = `'REDESIGN QC BY'`

### 2. `HsGoals.SearchParams.ts` — Build ClickUp query

**Approach:** Fetch by status only (`statuses[]=approved&statuses[]=sent&statuses[]=redesign sent&include_closed=true`), then filter dates client-side. This matches the existing `useHsIncomeReport` pattern and handles the three independent date fields cleanly. ✅

Note: Redesign tasks use the `redesign sent` status, so we include it in the status filter.

### 3. `HsGoals.helpers.ts` — Core calculation logic

**`parseHsGoalTasks(tasks, year, month)`:**

- For each task, extract all 3 completion dates and all 3 mile values
- Determine which work types are "active" for the selected month (date falls in month)
- For active work types, extract the corresponding assignee + QC + miles
- Build a normalized task record per work-type contribution

**`computeHsSummary(parsedTasks, config)`:**

- Accumulate per-person stats across all work types:
  - Asbuilt miles, Design miles, Redesign miles, total miles
  - Task count per work type
- Produce `designerPerformance[]` and `qcPerformance[]` arrays using `MemberPerformance` (reuse existing type — `totalPoints` = total miles)
- Produce `tasksWithWarnings[]` for tasks with missing fields

**Shared utilities approach:** Extract reusable helper functions into `MonthlyGoals.utils.ts` and import from both BAU and HS. This follows the codebase pattern (see `utils/helperFunctions.ts`, `utils/tasksFunctions.ts`) and avoids duplication. ✅

Functions to extract:

- `getCustomFieldValue`, `asValidUser`, `getNormalizedTaskUsers`, `getMemberName`
- `getDateValue`, `toMemberShares`
- `PerformanceAccumulator` type, `addSharesToAccumulator`, `toPerformance`
- `buildTaskWarnings` (adapt for HS field names)

### 4. `HsGoals.hooks.ts` — `useHsGoals` hook

Mirror `useBauGoals`:

- Build search params with `useMemo`
- Call `useFetchClickUpTasks(CLICKUP_LIST_IDS.cciHs, searchParams)`
- Parse and compute summary with `useMemo`

### 5. `HsGoals.tsx` — Page component

Mirror `BauGoals.tsx`:

- Month/year selector (reuse `MonthSelector`)
- Goals config dialog (reuse `GoalsConfigDialog`)
- Summary cards (Total Tasks + Total Miles instead of Total Design Points)
- Two `MemberPerformanceTable` tables (Designer + QC) — reuse existing component, "Points" column shows miles
- **Third "Combined Production" table** showing per-person breakdown by work type (Asbuilt + Design + Redesign miles)
- `WarningsPanel` (reuse existing)

The combined table will need a new component `CombinedProductionTable` to display the work-type breakdown.

### 6. Wire into `MonthlyGoals.tsx`

- Enable the "HS" tab (remove `disabled` and "coming soon" badge)
- Lazy-import `HsGoals` in the HS `TabsContent`

### 7. Share `useGoalsConfig` between BAU and HS

**Approach:** Use the **same** localStorage config object with namespaced month keys. ✅

Current BAU keys: `2025-01`, `2025-02`, etc.
HS keys will use: `hs-2025-01`, `hs-2025-02`, etc.

This allows:

- Single export/import file for all configs (BAU + HS)
- Shared `useGoalsConfig` hook (no changes needed)
- Clear separation between BAU and HS goals per month

The `HsGoals` component will pass `monthKey = 'hs-' + monthKey` to the hook.

---

## What We Reuse

- **`MonthSelector`** — as-is
- **`MemberPerformanceTable`** — as-is (miles display works with the existing `formatPoints` + `totalPoints` field)
- **`WarningsPanel`** — as-is
- **`GoalsConfigDialog` + `ExportImportConfig`** — as-is
- **`useGoalsConfig`** — possibly with a separate storage key for HS
- **`useFetchClickUpTasks`** — as-is
- **`getCustomField`** utility with `'hs'` source preference
- **Shared types:** `MemberPerformance`, `MonthlyGoalTask`, `MonthlyGoalsSummary`, `MonthGoalsConfig`, `MemberShare`

---

## Validation & Error Detection System

### Overview

Implement a comprehensive validation system that checks data integrity, detects inconsistencies, and reports warnings without blocking operations (similar to BAU).

### Validation Categories

#### 1. **Missing Required Fields** (Non-blocking warnings)

For each work type that has a completion date in the selected month:

**Asbuilt validation:**

- ✅ Has `PREASBUILT ACTUAL COMPLETION DATE` → Must have:
  - `ASBUILT MILES` (not null/zero)
  - `Assignee` (task.assignees not empty)
  - `PREASBUILT QC BY` (not empty)

**Design validation:**

- ✅ Has `ACTUAL COMPLETION DATE` → Must have:
  - `DESIGN MILES` (not null/zero)
  - `DESIGN ASSIGNEE` custom field (not empty)
  - `DESIGN QC BY` (not empty)

**Redesign validation:**

- ✅ Has `REDESIGN ACTUAL COMPLETION DATE` → Must have:
  - `REDESIGN ROUNDED MILES` (not null/zero)
  - `Assignee` (task.assignees not empty)
  - `REDESIGN QC BY` (not empty)

#### 2. **Consistency Validation** (Detect data conflicts)

**PROJECT TYPE vs Status/Dates cross-validation:**

| PROJECT TYPE   | Expected Status               | Expected Completion Date            | Validation Rule                                                                                         |
| -------------- | ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `DESIGN` (0)   | `sent` or `approved`          | `ACTUAL COMPLETION DATE`            | If has `REDESIGN ACTUAL COMPLETION DATE` or status is `redesign sent` → **Inconsistency warning**       |
| `ASBUILT` (1)  | `sent` or `approved`          | `PREASBUILT ACTUAL COMPLETION DATE` | If has `REDESIGN ACTUAL COMPLETION DATE` or status is `redesign sent` → **Inconsistency warning**       |
| `REDESIGN` (2) | `redesign sent` or `approved` | `REDESIGN ACTUAL COMPLETION DATE`   | If missing `REDESIGN ACTUAL COMPLETION DATE` but has status `redesign sent` → **Inconsistency warning** |

**Status-based validation:**

- If `task.status.status === 'redesign sent'` → `PROJECT TYPE` should be `REDESIGN` (2)
- If `task.status.status === 'sent'` → `PROJECT TYPE` should be `DESIGN` (0) or `ASBUILT` (1)
- If has `REDESIGN ACTUAL COMPLETION DATE` with value → `PROJECT TYPE` should be `REDESIGN` (2)

#### 3. **Warning Message Format**

Each warning should be descriptive and actionable:

```typescript
// Missing field warnings
"Missing ASBUILT MILES for Asbuilt work";
"Missing DESIGN ASSIGNEE for Design work";
"Missing PREASBUILT QC BY for Asbuilt work";

// Consistency warnings
"PROJECT TYPE is DESIGN but task has REDESIGN ACTUAL COMPLETION DATE";
"Status is 'redesign sent' but PROJECT TYPE is not REDESIGN";
"PROJECT TYPE is REDESIGN but missing REDESIGN ACTUAL COMPLETION DATE";
"Has REDESIGN ACTUAL COMPLETION DATE but PROJECT TYPE is ASBUILT";
```

### Implementation Details

**New helper function: `buildHsTaskWarnings(task, workTypeContributions)`**

```typescript
interface WorkTypeContribution {
  type: "asbuilt" | "design" | "redesign";
  completionDate: Date | null;
  miles: number | null;
  assignees: User[];
  qcReviewers: User[];
}

function buildHsTaskWarnings(
  task: Task,
  contributions: WorkTypeContribution[],
): string[] {
  const warnings: string[] = [];

  // 1. Check missing fields for each active work type
  contributions.forEach((contrib) => {
    if (!contrib.completionDate) return; // Skip inactive work types

    if (contrib.miles === null || contrib.miles === 0) {
      warnings.push(`Missing ${contrib.type.toUpperCase()} MILES`);
    }
    if (contrib.assignees.length === 0) {
      warnings.push(`Missing assignee for ${contrib.type} work`);
    }
    if (contrib.qcReviewers.length === 0) {
      warnings.push(`Missing QC reviewer for ${contrib.type} work`);
    }
  });

  // 2. Check PROJECT TYPE consistency
  const projectTypeValue = getCustomFieldValue(task, "PROJECT TYPE");
  const projectType = getProjectTypeName(projectTypeValue);
  const status = task.status?.status?.toLowerCase();

  const hasRedesignDate = contributions.some(
    (c) => c.type === "redesign" && c.completionDate,
  );
  const hasDesignDate = contributions.some(
    (c) => c.type === "design" && c.completionDate,
  );
  const hasAsbuiltDate = contributions.some(
    (c) => c.type === "asbuilt" && c.completionDate,
  );

  // Status vs PROJECT TYPE
  if (status === "redesign sent" && projectType !== "REDESIGN") {
    warnings.push(
      `Status is 'redesign sent' but PROJECT TYPE is ${projectType}`,
    );
  }

  // Completion dates vs PROJECT TYPE
  if (projectType === "DESIGN" && hasRedesignDate) {
    warnings.push("PROJECT TYPE is DESIGN but has REDESIGN completion date");
  }
  if (projectType === "ASBUILT" && hasRedesignDate) {
    warnings.push("PROJECT TYPE is ASBUILT but has REDESIGN completion date");
  }
  if (projectType === "REDESIGN" && !hasRedesignDate) {
    warnings.push(
      "PROJECT TYPE is REDESIGN but missing REDESIGN completion date",
    );
  }

  return warnings;
}

export { buildHsTaskWarnings };
```

### Validation Rules (Finalized)

**Q6: Work Type Phases**

- **DESIGN tasks** have 2 phases: Asbuilt → Design (most common, but not always both)
- **REDESIGN tasks** are separate work type (cannot coexist with Design/Asbuilt on same task)
- Validation: If has `REDESIGN ACTUAL COMPLETION DATE` AND (`ACTUAL COMPLETION DATE` OR `PREASBUILT ACTUAL COMPLETION DATE`) → **Warning + Exclude from calculations**

**Q7: Validation Strictness**

- Inconsistencies = **Warning + Exclude from calculations**
- Tasks with warnings are shown in WarningsPanel but NOT counted in performance metrics

**Q8: Multiple Completion Dates**

- A task with both `ACTUAL COMPLETION DATE` and `REDESIGN ACTUAL COMPLETION DATE` is **invalid** → Warning
- Valid scenarios:
  - Asbuilt only: Has `PREASBUILT ACTUAL COMPLETION DATE`
  - Design only: Has `ACTUAL COMPLETION DATE`
  - Asbuilt + Design: Has both `PREASBUILT ACTUAL COMPLETION DATE` and `ACTUAL COMPLETION DATE`
  - Redesign only: Has `REDESIGN ACTUAL COMPLETION DATE`

**Q9: Zero vs Null Miles**

- Both `0` and `null` are **invalid** → Warning
- Reason: Cannot bill 0 miles; minimum is 1 mile

**Q10: Assignee Sources**

- **Asbuilt:** Use `task.assignees` (NO fallback to DESIGN ASSIGNEE)
- **Design:** Use `DESIGN ASSIGNEE` custom field (NO fallback to task.assignees)
- **Redesign:** Use `task.assignees` (NO fallback)
- Missing assignee = **Warning**

---

## Warnings Export Functionality

### Overview

Add export capability to the WarningsPanel to generate a shareable report of all validation issues.

### Export Options Analysis

**Option 1: Excel Export** ✅ **RECOMMENDED**

- **Pros:**
  - Already used in codebase (`ExcelJS` + `file-saver`)
  - Professional format, easy to share
  - Can include formatting, filters, multiple sheets
  - No backend required
- **Cons:** None
- **Implementation:** Reuse `generateBauIncomeExcel` pattern

**Option 2: CSV Export**

- **Pros:** Simple, universal format
- **Cons:** No formatting, less professional
- **Implementation:** Simple string concatenation

**Option 3: Email (via backend)**

- **Pros:** Direct delivery
- **Cons:** Requires backend setup, more complex
- **Not recommended** for this phase

### Implementation Plan

**1. Create `generateWarningsExcel` utility function**

Location: `src/pages/MonthlyGoals/utils/exportWarnings.ts`

```typescript
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { MonthlyGoalTask } from "../MonthlyGoals.types";

export function generateWarningsExcel(
  tasksWithWarnings: MonthlyGoalTask[],
  monthYear: string,
  type: "BAU" | "HS",
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Warnings", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Define columns
  worksheet.columns = [
    { header: "Task ID", key: "id", width: 20 },
    { header: "Task Name", key: "name", width: 40 },
    { header: "Warnings", key: "warnings", width: 60 },
    { header: "Warning Count", key: "count", width: 15 },
  ];

  // Add data rows
  tasksWithWarnings.forEach((task) => {
    worksheet.addRow({
      id: task.id,
      name: task.name,
      warnings: task.warnings.join("; "),
      count: task.warnings.length,
    });
  });

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "DC2626" }, // Red for warnings
  };

  // Add borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 4 },
  };

  // Generate file
  workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      blob,
      `${type}_Warnings_${monthYear}_${new Date().toLocaleDateString()}.xlsx`,
    );
  });
}
```

**2. Update `WarningsPanel` component**

Add export button to the panel header:

```typescript
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateWarningsExcel } from '../utils/exportWarnings';

// Inside WarningsPanel component
<div className="flex items-center justify-between">
  <h3>Tasks with Warnings ({tasksWithWarnings.length})</h3>
  {tasksWithWarnings.length > 0 && (
    <Button
      variant="outline"
      size="sm"
      onClick={() => generateWarningsExcel(tasksWithWarnings, monthKey, 'HS')}
    >
      <Download className="mr-2 h-4 w-4" />
      Export Warnings
    </Button>
  )}
</div>
```

**3. Enhanced Excel Format**

For HS warnings, include additional columns:

- Work Type (Asbuilt/Design/Redesign)
- Completion Date
- Miles Value
- Assignee
- QC Reviewer

This provides full context for fixing issues.

---

## Implementation Order

1. **Extract shared utilities** — Create `MonthlyGoals.utils.ts` and refactor `BauGoals.helpers.ts` to use it
2. **Create HS constants** — `HsGoals.constants.ts` with all field names
3. **Create search params** — `HsGoals.SearchParams.ts` with status-based filtering
4. **Create HS helpers** — `HsGoals.helpers.ts` with:
   - `parseHsGoalTasks` with comprehensive validation
   - `buildHsTaskWarnings` with all validation rules
   - `computeHsSummary` excluding tasks with warnings
5. **Create warnings export utility** — `MonthlyGoals/utils/exportWarnings.ts`
6. **Update WarningsPanel** — Add export button for warnings
7. **Create HS hook** — `HsGoals.hooks.ts` with `useHsGoals`
8. **Create combined table** — `CombinedProductionTable.tsx` component
9. **Create HS page** — `HsGoals.tsx` with all UI components
10. **Wire into main page** — Enable HS tab in `MonthlyGoals.tsx`
11. **Test validation** — Verify all warning scenarios and exclusion logic
12. **Test export** — Verify warnings Excel export functionality

---

## New Components & Types

### `CombinedProductionTable.tsx`

A new table component to display per-person production breakdown across all work types:

| Member  | Asbuilt Miles | Design Miles | Redesign Miles | Total Miles | Tasks |
| ------- | ------------- | ------------ | -------------- | ----------- | ----- |
| Nathaly | 73.46         | 41.15        | 5.04           | 119.65      | 75    |

### Extended `MonthlyGoalsSummary` type

Add a new field for HS:

```typescript
interface HsMonthlyGoalsSummary extends MonthlyGoalsSummary {
  combinedProduction: CombinedProductionMember[];
}

interface CombinedProductionMember {
  memberId: number;
  memberName: string;
  asbuiltMiles: number;
  designMiles: number;
  redesignMiles: number;
  totalMiles: number;
  taskCount: number;
}
```
