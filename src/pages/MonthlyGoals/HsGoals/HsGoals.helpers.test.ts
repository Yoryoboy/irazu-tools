import { describe, expect, it } from 'vitest';
import { Task, User } from '../../../types/Task';
import { dayjs } from '../../../utils/dayjs';
import { ARGENTINA_TZ } from '../MonthlyGoals.constants';
import { MonthGoalsConfig } from '../MonthlyGoals.types';
import { computeHsSummary, parseHsGoalTasks } from './HsGoals.helpers';
import {
  FIELD_ACTUAL_COMPLETION_DATE,
  FIELD_ASBUILT_MILES,
  FIELD_DESIGN_ASSIGNEE,
  FIELD_DESIGN_MILES,
  FIELD_DESIGN_QC_BY,
  FIELD_PREASBUILT_COMPLETION_DATE,
  FIELD_PREASBUILT_QC_BY,
  FIELD_PROJECT_TYPE,
  FIELD_REDESIGN_COMPLETION_DATE,
  FIELD_REDESIGN_MILES,
  FIELD_REDESIGN_QC_BY,
} from './HsGoals.constants';

const defaultConfig: MonthGoalsConfig = {
  defaultDesignerGoal: 400,
  defaultQcGoal: 400,
  memberOverrides: {},
};

const designerA: User = { id: 101, username: 'Designer A' };
const designerB: User = { id: 102, username: 'Designer B' };
const qcA: User = { id: 201, username: 'QC A' };
const qcB: User = { id: 202, username: 'QC B' };

function toTimestamp(year: number, month: number, day: number) {
  const monthString = String(month).padStart(2, '0');
  const dayString = String(day).padStart(2, '0');

  return dayjs.tz(`${year}-${monthString}-${dayString}`, ARGENTINA_TZ).valueOf();
}

function createTask(task: Partial<Task>): Task {
  return {
    id: task.id ?? 'task-1',
    name: task.name ?? 'Task',
    status: task.status,
    assignees: task.assignees,
    custom_fields: task.custom_fields,
  };
}

describe('HsGoals.helpers', () => {
  it('parses and aggregates valid asbuilt + design contributions', () => {
    const task = createTask({
      id: 'valid-1',
      name: 'Valid Task',
      status: { status: 'sent' },
      assignees: [designerA],
      custom_fields: [
        { name: FIELD_PROJECT_TYPE, value: 0 },
        { name: FIELD_PREASBUILT_COMPLETION_DATE, value: toTimestamp(2026, 1, 10) },
        { name: FIELD_ACTUAL_COMPLETION_DATE, value: toTimestamp(2026, 1, 12) },
        { name: FIELD_ASBUILT_MILES, value: 10 },
        { name: FIELD_DESIGN_MILES, value: 20 },
        { name: FIELD_DESIGN_ASSIGNEE, value: [designerB] },
        { name: FIELD_PREASBUILT_QC_BY, value: [qcA] },
        { name: FIELD_DESIGN_QC_BY, value: [qcB] },
      ],
    });

    const parsed = parseHsGoalTasks([task], 2026, 1);
    const summary = computeHsSummary(parsed, defaultConfig);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].warnings).toHaveLength(0);
    expect(summary.totalTasks).toBe(1);
    expect(summary.totalMiles).toBe(30);

    const designerMap = new Map(summary.designerPerformance.map(member => [member.memberId, member]));
    expect(designerMap.get(101)?.totalPoints).toBe(10);
    expect(designerMap.get(102)?.totalPoints).toBe(20);

    const combinedMap = new Map(summary.combinedProduction.map(member => [member.memberId, member]));
    expect(combinedMap.get(101)?.asbuiltMiles).toBe(10);
    expect(combinedMap.get(102)?.designMiles).toBe(20);
  });

  it('excludes invalid cross-phase tasks from metrics', () => {
    const task = createTask({
      id: 'invalid-1',
      name: 'Invalid Task',
      status: { status: 'redesign sent' },
      assignees: [designerA],
      custom_fields: [
        { name: FIELD_PROJECT_TYPE, value: 2 },
        { name: FIELD_ACTUAL_COMPLETION_DATE, value: toTimestamp(2026, 1, 13) },
        { name: FIELD_REDESIGN_COMPLETION_DATE, value: toTimestamp(2026, 1, 14) },
        { name: FIELD_DESIGN_MILES, value: 15 },
        { name: FIELD_REDESIGN_MILES, value: 8 },
        { name: FIELD_DESIGN_ASSIGNEE, value: [designerB] },
        { name: FIELD_DESIGN_QC_BY, value: [qcA] },
        { name: FIELD_REDESIGN_QC_BY, value: [qcB] },
      ],
    });

    const parsed = parseHsGoalTasks([task], 2026, 1);
    const summary = computeHsSummary(parsed, defaultConfig);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].excludedFromMetrics).toBe(true);
    expect(
      parsed[0].warnings.some(warning =>
        warning.includes('REDESIGN ACTUAL COMPLETION DATE together with DESIGN/ASBUILT')
      )
    ).toBe(true);
    expect(summary.totalTasks).toBe(0);
    expect(summary.totalMiles).toBe(0);
    expect(summary.tasksWithWarnings).toHaveLength(1);
  });

  it('warns when required design data is missing', () => {
    const task = createTask({
      id: 'warnings-1',
      name: 'Warnings Task',
      status: { status: 'sent' },
      custom_fields: [
        { name: FIELD_PROJECT_TYPE, value: 0 },
        { name: FIELD_ACTUAL_COMPLETION_DATE, value: toTimestamp(2026, 1, 20) },
        { name: FIELD_DESIGN_MILES, value: 0 },
        { name: FIELD_DESIGN_QC_BY, value: [qcA] },
      ],
    });

    const parsed = parseHsGoalTasks([task], 2026, 1);
    const summary = computeHsSummary(parsed, defaultConfig);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].warnings).toContain('Missing DESIGN ROUNDED MILES for Design work');
    expect(parsed[0].warnings).toContain('Missing assignee for Design work');
    expect(summary.totalTasks).toBe(1);
    expect(summary.totalMiles).toBe(0);
  });

  it('treats redesign rounded miles as valid when it is zero', () => {
    const task = createTask({
      id: 'redesign-zero-valid',
      name: 'Redesign Zero Valid',
      status: { status: 'redesign sent' },
      assignees: [designerA],
      custom_fields: [
        { name: FIELD_PROJECT_TYPE, value: 2 },
        { name: FIELD_REDESIGN_COMPLETION_DATE, value: toTimestamp(2026, 1, 22) },
        { name: FIELD_REDESIGN_MILES, value: 0 },
        { name: FIELD_REDESIGN_QC_BY, value: [qcA] },
      ],
    });

    const parsed = parseHsGoalTasks([task], 2026, 1);
    const summary = computeHsSummary(parsed, defaultConfig);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].warnings).toHaveLength(0);
    expect(summary.totalTasks).toBe(1);
    expect(summary.totalMiles).toBe(0);
  });

  it('warns when design rounded miles is below one', () => {
    const task = createTask({
      id: 'design-below-one',
      name: 'Design Below One',
      status: { status: 'sent' },
      custom_fields: [
        { name: FIELD_PROJECT_TYPE, value: 0 },
        { name: FIELD_ACTUAL_COMPLETION_DATE, value: toTimestamp(2026, 1, 23) },
        { name: FIELD_DESIGN_MILES, value: 0.5 },
        { name: FIELD_DESIGN_ASSIGNEE, value: [designerB] },
        { name: FIELD_DESIGN_QC_BY, value: [qcA] },
      ],
    });

    const parsed = parseHsGoalTasks([task], 2026, 1);
    const summary = computeHsSummary(parsed, defaultConfig);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].warnings).toContain('Missing DESIGN ROUNDED MILES for Design work');
    expect(parsed[0].warnings).not.toContain('Missing assignee for Design work');
    expect(parsed[0].warnings).not.toContain('Missing DESIGN QC BY for Design work');
    expect(summary.totalMiles).toBe(0);
  });
});
