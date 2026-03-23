# High Split Production Calculation

## Overview

The High Split project tracking system calculates production metrics based on three distinct work types: **Asbuilt**, **Design**, and **Redesign**. Each work type has its own assignee field, completion date field, and mileage field, all sourced from ClickUp custom fields.

## Data Structure

### Custom Fields from ClickUp

The system relies on the following custom fields from ClickUp:

#### Asbuilt Work Type

- **Assignee**: `Assignee` (primary field)
- **Completion Date**: `PREASBUILT ACTUAL COMPLETION DATE` (timestamp)
- **Mileage**: `ASBUILT MILES` (number)
- **QC Person**: `PREASBUILT QC BY` (primary field)

#### Design Work Type

- **Assignee**: `DESIGN ASSIGNEE` (primary field)
- **Completion Date**: `ACTUAL COMPLETION DATE` (timestamp)
- **Mileage**: `DESIGN MILES` (number)
- **QC Person**: `DESIGN QC BY` (primary field)

#### Redesign Work Type

- **Assignee**: `Assignee` (primary field, same as Asbuilt)
- **Completion Date**: `REDESIGN ACTUAL COMPLETION DATE` (timestamp)
- **Mileage**: `REDESIGN MILES` (number)
- **QC Person**: `REDESIGN QC BY` (primary field)

## Calculation Process

### 1. Month Detection

The system identifies all available months by scanning all three completion date fields:

- For each task, check if `preasbuiltCompletionDate`, `actualCompletionDate`, or `redesignCompletionDate` exists
- Extract year and month from valid dates
- Count total tasks per month across all work types

### 2. Filtering by Work Type

Once a month is selected, tasks are filtered separately for each work type:

**Asbuilt Filter**:

- Keep tasks where `preasbuiltCompletionDate` falls within the selected month
- Extract assignee from `Assignee` field
- Extract QC person from `PREASBUILT QC BY` field
- Use `ASBUILT MILES` for mileage calculations

**Design Filter**:

- Keep tasks where `actualCompletionDate` falls within the selected month
- Extract assignee from `DESIGN ASSIGNEE` field
- Extract QC person from `DESIGN QC BY` field
- Use `DESIGN MILES` for mileage calculations

**Redesign Filter**:

- Keep tasks where `redesignCompletionDate` falls within the selected month
- Extract assignee from `Assignee` field
- Extract QC person from `REDESIGN QC BY` field
- Use `REDESIGN MILES` for mileage calculations

### 3. Combined Person Totals

After calculating stats for each work type separately, the system combines them to show each person's total production across all work types:

**Combination Logic**:

- For each person who appears in any work type (Asbuilt, Design, or Redesign):
  - Sum their Asbuilt miles (from Asbuilt assignee stats)
  - Sum their Design miles (from Design assignee stats)
  - Sum their Redesign miles (from Redesign assignee stats)
  - Calculate total miles: `asbuiltMiles + designMiles + redesignMiles`
  - Sum task count across all work types
- Sort by total miles (descending)

## Example Calculation

Given a person "Nathaly" in January 2026:

1. **Asbuilt**: 58 tasks assigned to Nathaly with `preasbuiltCompletionDate` in January → 73.46 miles
2. **Design**: 14 tasks assigned to Nathaly with `actualCompletionDate` in January → 41.15 miles
3. **Redesign**: 3 tasks assigned to Nathaly with `redesignCompletionDate` in January → 5.04 miles

**Combined Total for Nathaly**: 73.46 + 41.15 + 5.04 = **119.65 miles**
