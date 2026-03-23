# HS Goals - Fixes & Improvements

This document tracks pending fixes and improvements for the HS Goals implementation.

---

## 1. Optimize Task Fetching Strategy

### Current Problem
The current implementation fetches **all** tasks with statuses `approved`, `sent`, `redesign sent` from the HS list, then filters client-side by month. With 3+ years of historical data, this results in 20+ paginated API calls (~2000+ tasks).

### Solution
**Fetch only tasks for the selected month** using 3 parallel API calls, one per completion date field:

1. **Call 1:** Filter by `PREASBUILT ACTUAL COMPLETION DATE` in selected month
2. **Call 2:** Filter by `ACTUAL COMPLETION DATE` in selected month
3. **Call 3:** Filter by `REDESIGN ACTUAL COMPLETION DATE` in selected month
4. **Deduplicate** results by task ID
5. **Then** run validation and calculations

### Implementation Changes

**`HsGoals.SearchParams.ts`:**
```typescript
export function getHsGoalsSearchParams(
  year: number,
  month: number
): { asbuilt: SearchParams; design: SearchParams; redesign: SearchParams } {
  const startOfMonth = dayjs.tz(`${year}-${month}-01`, ARGENTINA_TZ).startOf('month');
  const endOfMonth = startOfMonth.endOf('month');
  const range = [startOfMonth.valueOf(), endOfMonth.valueOf()];

  const asbuiltFieldId = getCustomField(FIELD_PREASBUILT_COMPLETION_DATE, 'hs').id;
  const designFieldId = getCustomField(FIELD_ACTUAL_COMPLETION_DATE, 'hs').id;
  const redesignFieldId = getCustomField(FIELD_REDESIGN_COMPLETION_DATE, 'hs').id;

  const baseParams = {
    'statuses[]': HS_ACTIVE_STATUSES,
    'include_closed': 'true',
  };

  return {
    asbuilt: {
      ...baseParams,
      custom_fields: JSON.stringify([{ field_id: asbuiltFieldId, operator: 'RANGE', value: range }]),
    },
    design: {
      ...baseParams,
      custom_fields: JSON.stringify([{ field_id: designFieldId, operator: 'RANGE', value: range }]),
    },
    redesign: {
      ...baseParams,
      custom_fields: JSON.stringify([{ field_id: redesignFieldId, operator: 'RANGE', value: range }]),
    },
  };
}
```

**`HsGoals.hooks.ts`:**
- Make 3 parallel calls using `useFetchClickUpTasks` for each date field
- Deduplicate by task ID before parsing
- Pass deduplicated tasks to `parseHsGoalTasks`

### Benefits
- Reduces API calls from ~20+ to ~3-6 (depending on task distribution)
- Faster load times
- Less data transferred

---

## 2. Add Task Links in Warnings Panel

### Current State
`WarningsPanel` shows task name and warnings but no link to the task in ClickUp.

### Solution
Add a clickable link to each task in the warnings list.

### Implementation Changes

**`WarningsPanel.tsx`:**
```tsx
// Add link column/button
<a
  href={`https://app.clickup.com/t/${task.id}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-500 hover:underline"
>
  Open in ClickUp
</a>
```

**`MonthlyGoals.types.ts`:**
- Ensure `MonthlyGoalTask.id` contains the ClickUp task ID (already does via `task.id`)

---

## 3. Implement Warnings Export to Excel

### Current State
Warnings are displayed in `WarningsPanel` but cannot be exported.

### Solution
Add an "Export Warnings" button that generates an Excel file with all warning details.

### Implementation Changes

**Create `src/pages/MonthlyGoals/utils/exportWarnings.ts`:**
```typescript
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { MonthlyGoalTask } from '../MonthlyGoals.types';

export function generateWarningsExcel(
  tasksWithWarnings: MonthlyGoalTask[],
  monthYear: string,
  type: 'BAU' | 'HS'
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Warnings');

  worksheet.columns = [
    { header: 'Task ID', key: 'id', width: 20 },
    { header: 'Task Name', key: 'name', width: 40 },
    { header: 'ClickUp Link', key: 'link', width: 50 },
    { header: 'Warnings', key: 'warnings', width: 80 },
    { header: 'Warning Count', key: 'count', width: 15 },
  ];

  tasksWithWarnings.forEach(task => {
    worksheet.addRow({
      id: task.id,
      name: task.name,
      link: `https://app.clickup.com/t/${task.id}`,
      warnings: task.warnings.join('; '),
      count: task.warnings.length,
    });
  });

  // Style header row (red for warnings)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DC2626' } };

  workbook.xlsx.writeBuffer().then(data => {
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${type}_Warnings_${monthYear}.xlsx`);
  });
}
```

**Update `WarningsPanel.tsx`:**
```tsx
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateWarningsExcel } from '../utils/exportWarnings';

// Add export button in header
<Button
  variant="outline"
  size="sm"
  onClick={() => generateWarningsExcel(tasksWithWarnings, monthKey, 'HS')}
>
  <Download className="mr-2 h-4 w-4" />
  Export Warnings
</Button>
```

---

## Implementation Order

1. **Fix #1:** Optimize task fetching (3 parallel calls + deduplication)
2. **Fix #2:** Add ClickUp links to warnings
3. **Fix #3:** Implement warnings export to Excel

---

## Status

| Fix | Status |
|-----|--------|
| #1 - Optimize fetching | ⏳ Pending |
| #2 - Task links | ⏳ Pending |
| #3 - Export warnings | ⏳ Pending |
