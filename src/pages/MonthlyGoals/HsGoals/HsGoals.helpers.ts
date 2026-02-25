import { Task, User } from '../../../types/Task';
import { dayjs } from '../../../utils/dayjs';
import { ARGENTINA_TZ, DEFAULT_DESIGNER_GOAL, DEFAULT_QC_GOAL } from '../MonthlyGoals.constants';
import {
  CombinedProductionMember,
  HsMonthlyGoalTask,
  HsMonthlyGoalsSummary,
  HsWorkContribution,
  HsWorkType,
  MemberPerformance,
  MemberShare,
  MonthGoalsConfig,
} from '../MonthlyGoals.types';
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

interface PerformanceAccumulator {
  memberId: number;
  memberName: string;
  totalPoints: number;
  taskIds: Set<string>;
}

interface CombinedAccumulator {
  memberId: number;
  memberName: string;
  asbuiltMiles: number;
  designMiles: number;
  redesignMiles: number;
  totalMiles: number;
  taskCount: number;
  contributionKeys: Set<string>;
}

interface TaskDateValues {
  asbuilt: Date | null;
  design: Date | null;
  redesign: Date | null;
}

interface HsWarningsResult {
  warnings: string[];
  excludedFromMetrics: boolean;
}

function getTaskId(task: Task): string {
  return task.id ?? task.custom_id ?? task.name;
}

function getCustomFieldValue(task: Task, fieldName: string): unknown {
  return task.custom_fields?.find(field => field.name === fieldName)?.value;
}

function asValidUser(user: unknown): User | null {
  if (typeof user !== 'object' || user === null) {
    return null;
  }

  const maybeUser = user as User;

  if (typeof maybeUser.id !== 'number') {
    return null;
  }

  return maybeUser;
}

function getNormalizedTaskUsers(users: unknown): User[] {
  if (Array.isArray(users)) {
    return users
      .map(asValidUser)
      .filter((user): user is User => user !== null);
  }

  const singleUser = asValidUser(users);
  return singleUser ? [singleUser] : [];
}

function getMemberName(user: User): string {
  return user.username?.trim() || `User ${user.id}`;
}

function getDateValue(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const parsed = dayjs(timestamp).tz(ARGENTINA_TZ);
  return parsed.isValid() ? parsed.toDate() : null;
}

function isDateInMonth(date: Date, year: number, month: number): boolean {
  const parsed = dayjs(date).tz(ARGENTINA_TZ);
  return parsed.year() === year && parsed.month() + 1 === month;
}

function getDateValueInMonth(value: unknown, year: number, month: number): Date | null {
  const date = getDateValue(value);

  if (!date) {
    return null;
  }

  return isDateInMonth(date, year, month) ? date : null;
}

function getMilesValue(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isMilesValidForWorkType(type: HsWorkType, miles: number | null): boolean {
  if (miles === null) {
    return false;
  }

  if (type === 'redesign') {
    return true;
  }

  return miles >= 1;
}

function shouldAllocateShares(type: HsWorkType, miles: number | null): boolean {
  if (miles === null) {
    return false;
  }

  if (type === 'redesign') {
    return miles > 0;
  }

  return miles >= 1;
}

function shouldCountMilesInTotals(type: HsWorkType, miles: number | null): boolean {
  if (miles === null) {
    return false;
  }

  if (type === 'redesign') {
    return miles >= 0;
  }

  return miles >= 1;
}

function toMemberShares(users: User[], miles: number | null, type: HsWorkType): MemberShare[] {
  if (!shouldAllocateShares(type, miles) || users.length === 0) {
    return [];
  }

  const splitMiles = miles / users.length;

  return users.map(user => ({
    memberId: user.id as number,
    memberName: getMemberName(user),
    points: splitMiles,
  }));
}

function toProjectTypeName(value: unknown): 'DESIGN' | 'ASBUILT' | 'REDESIGN' | 'UNKNOWN' {
  if (typeof value === 'number') {
    if (value === 0) return 'DESIGN';
    if (value === 1) return 'ASBUILT';
    if (value === 2) return 'REDESIGN';
    return 'UNKNOWN';
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();

    if (normalized === '0') return 'DESIGN';
    if (normalized === '1') return 'ASBUILT';
    if (normalized === '2') return 'REDESIGN';
    if (normalized === 'DESIGN') return 'DESIGN';
    if (normalized === 'ASBUILT') return 'ASBUILT';
    if (normalized === 'REDESIGN') return 'REDESIGN';
  }

  return 'UNKNOWN';
}

function getWorkTypeLabel(type: HsWorkType): string {
  if (type === 'asbuilt') {
    return 'Asbuilt';
  }

  if (type === 'design') {
    return 'Design';
  }

  return 'Redesign';
}

function getMilesFieldForType(type: HsWorkType): string {
  if (type === 'asbuilt') {
    return FIELD_ASBUILT_MILES;
  }

  if (type === 'design') {
    return FIELD_DESIGN_MILES;
  }

  return FIELD_REDESIGN_MILES;
}

function getQcFieldForType(type: HsWorkType): string {
  if (type === 'asbuilt') {
    return FIELD_PREASBUILT_QC_BY;
  }

  if (type === 'design') {
    return FIELD_DESIGN_QC_BY;
  }

  return FIELD_REDESIGN_QC_BY;
}

function buildHsTaskWarnings(
  task: Task,
  contributions: HsWorkContribution[],
  allCompletionDates: TaskDateValues
): HsWarningsResult {
  const warnings = new Set<string>();
  let excludedFromMetrics = false;

  contributions.forEach(contribution => {
    const workTypeLabel = getWorkTypeLabel(contribution.type);

    if (!isMilesValidForWorkType(contribution.type, contribution.miles)) {
      warnings.add(`Missing ${getMilesFieldForType(contribution.type)} for ${workTypeLabel} work`);
    }

    if (contribution.assigneeCount === 0) {
      warnings.add(`Missing assignee for ${workTypeLabel} work`);
    }

    if (contribution.qcReviewerCount === 0) {
      warnings.add(`Missing ${getQcFieldForType(contribution.type)} for ${workTypeLabel} work`);
    }
  });

  const status = task.status?.status?.toLowerCase();
  const projectType = toProjectTypeName(getCustomFieldValue(task, FIELD_PROJECT_TYPE));
  const hasAsbuiltDate = Boolean(allCompletionDates.asbuilt);
  const hasDesignDate = Boolean(allCompletionDates.design);
  const hasRedesignDate = Boolean(allCompletionDates.redesign);

  if (hasRedesignDate && (hasAsbuiltDate || hasDesignDate)) {
    warnings.add(
      'Task has REDESIGN ACTUAL COMPLETION DATE together with DESIGN/ASBUILT completion dates'
    );
    excludedFromMetrics = true;
  }

  if (status === 'redesign sent' && projectType !== 'REDESIGN') {
    warnings.add(`Status is 'redesign sent' but PROJECT TYPE is ${projectType}`);
  }

  if (status === 'sent' && projectType !== 'DESIGN' && projectType !== 'ASBUILT') {
    warnings.add(`Status is 'sent' but PROJECT TYPE is ${projectType}`);
  }

  if (projectType === 'REDESIGN' && !hasRedesignDate) {
    warnings.add('PROJECT TYPE is REDESIGN but missing REDESIGN ACTUAL COMPLETION DATE');
  }

  if (hasRedesignDate && projectType !== 'REDESIGN') {
    warnings.add(`Has REDESIGN ACTUAL COMPLETION DATE but PROJECT TYPE is ${projectType}`);
  }

  return {
    warnings: Array.from(warnings),
    excludedFromMetrics,
  };
}

function addSharesToAccumulator(
  shares: MemberShare[],
  taskId: string,
  accumulator: Map<number, PerformanceAccumulator>
) {
  shares.forEach(share => {
    const existing = accumulator.get(share.memberId);

    if (existing) {
      existing.totalPoints += share.points;
      existing.taskIds.add(taskId);
      return;
    }

    accumulator.set(share.memberId, {
      memberId: share.memberId,
      memberName: share.memberName,
      totalPoints: share.points,
      taskIds: new Set([taskId]),
    });
  });
}

function toPerformance(
  accumulator: Map<number, PerformanceAccumulator>,
  defaultGoal: number,
  goalOverrideByMember: MonthGoalsConfig['memberOverrides'],
  overrideKey: 'designerGoal' | 'qcGoal'
): MemberPerformance[] {
  return Array.from(accumulator.values())
    .map(member => {
      const overrideGoal = goalOverrideByMember[member.memberId]?.[overrideKey];
      const goal = overrideGoal ?? defaultGoal;

      return {
        memberId: member.memberId,
        memberName: member.memberName,
        totalPoints: member.totalPoints,
        taskCount: member.taskIds.size,
        goal,
        progressPercent: goal > 0 ? (member.totalPoints / goal) * 100 : 0,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

function addDesignerShareToCombined(
  combinedAccumulator: Map<number, CombinedAccumulator>,
  share: MemberShare,
  contribution: HsWorkContribution,
  taskId: string
) {
  const contributionKey = `${taskId}:${contribution.type}`;
  const existing = combinedAccumulator.get(share.memberId);

  if (existing) {
    existing.totalMiles += share.points;

    if (contribution.type === 'asbuilt') {
      existing.asbuiltMiles += share.points;
    } else if (contribution.type === 'design') {
      existing.designMiles += share.points;
    } else {
      existing.redesignMiles += share.points;
    }

    if (!existing.contributionKeys.has(contributionKey)) {
      existing.taskCount += 1;
      existing.contributionKeys.add(contributionKey);
    }

    return;
  }

  combinedAccumulator.set(share.memberId, {
    memberId: share.memberId,
    memberName: share.memberName,
    asbuiltMiles: contribution.type === 'asbuilt' ? share.points : 0,
    designMiles: contribution.type === 'design' ? share.points : 0,
    redesignMiles: contribution.type === 'redesign' ? share.points : 0,
    totalMiles: share.points,
    taskCount: 1,
    contributionKeys: new Set([contributionKey]),
  });
}

function toCombinedProduction(
  accumulator: Map<number, CombinedAccumulator>
): CombinedProductionMember[] {
  return Array.from(accumulator.values())
    .map(member => ({
      memberId: member.memberId,
      memberName: member.memberName,
      asbuiltMiles: member.asbuiltMiles,
      designMiles: member.designMiles,
      redesignMiles: member.redesignMiles,
      totalMiles: member.totalMiles,
      taskCount: member.taskCount,
    }))
    .sort((a, b) => b.totalMiles - a.totalMiles);
}

export function parseHsGoalTasks(tasks: Task[], year: number, month: number): HsMonthlyGoalTask[] {
  const parsedTasks: HsMonthlyGoalTask[] = [];

  tasks.forEach(task => {
    const allCompletionDates: TaskDateValues = {
      asbuilt: getDateValue(getCustomFieldValue(task, FIELD_PREASBUILT_COMPLETION_DATE)),
      design: getDateValue(getCustomFieldValue(task, FIELD_ACTUAL_COMPLETION_DATE)),
      redesign: getDateValue(getCustomFieldValue(task, FIELD_REDESIGN_COMPLETION_DATE)),
    };

    const asbuiltCompletionDate = getDateValueInMonth(
      getCustomFieldValue(task, FIELD_PREASBUILT_COMPLETION_DATE),
      year,
      month
    );
    const designCompletionDate = getDateValueInMonth(
      getCustomFieldValue(task, FIELD_ACTUAL_COMPLETION_DATE),
      year,
      month
    );
    const redesignCompletionDate = getDateValueInMonth(
      getCustomFieldValue(task, FIELD_REDESIGN_COMPLETION_DATE),
      year,
      month
    );

    const contributions: HsWorkContribution[] = [];

    if (asbuiltCompletionDate) {
      const designers = getNormalizedTaskUsers(task.assignees);
      const qcReviewers = getNormalizedTaskUsers(getCustomFieldValue(task, FIELD_PREASBUILT_QC_BY));
      const miles = getMilesValue(getCustomFieldValue(task, FIELD_ASBUILT_MILES));

      contributions.push({
        type: 'asbuilt',
        completionDate: asbuiltCompletionDate,
        miles,
        assigneeCount: designers.length,
        qcReviewerCount: qcReviewers.length,
        designers: toMemberShares(designers, miles, 'asbuilt'),
        qcReviewers: toMemberShares(qcReviewers, miles, 'asbuilt'),
      });
    }

    if (designCompletionDate) {
      const designers = getNormalizedTaskUsers(getCustomFieldValue(task, FIELD_DESIGN_ASSIGNEE));
      const qcReviewers = getNormalizedTaskUsers(getCustomFieldValue(task, FIELD_DESIGN_QC_BY));
      const miles = getMilesValue(getCustomFieldValue(task, FIELD_DESIGN_MILES));

      contributions.push({
        type: 'design',
        completionDate: designCompletionDate,
        miles,
        assigneeCount: designers.length,
        qcReviewerCount: qcReviewers.length,
        designers: toMemberShares(designers, miles, 'design'),
        qcReviewers: toMemberShares(qcReviewers, miles, 'design'),
      });
    }

    if (redesignCompletionDate) {
      const designers = getNormalizedTaskUsers(task.assignees);
      const qcReviewers = getNormalizedTaskUsers(getCustomFieldValue(task, FIELD_REDESIGN_QC_BY));
      const miles = getMilesValue(getCustomFieldValue(task, FIELD_REDESIGN_MILES));

      contributions.push({
        type: 'redesign',
        completionDate: redesignCompletionDate,
        miles,
        assigneeCount: designers.length,
        qcReviewerCount: qcReviewers.length,
        designers: toMemberShares(designers, miles, 'redesign'),
        qcReviewers: toMemberShares(qcReviewers, miles, 'redesign'),
      });
    }

    if (contributions.length === 0) {
      return;
    }

    const warningsResult = buildHsTaskWarnings(task, contributions, allCompletionDates);
    const totalMiles = contributions.reduce((total, contribution) => {
      if (!shouldCountMilesInTotals(contribution.type, contribution.miles)) {
        return total;
      }

      return total + contribution.miles;
    }, 0);

    parsedTasks.push({
      id: getTaskId(task),
      name: task.name,
      completionDate: contributions[0].completionDate,
      designPoints: totalMiles,
      designers: contributions.flatMap(contribution => contribution.designers),
      qcReviewers: contributions.flatMap(contribution => contribution.qcReviewers),
      warnings: warningsResult.warnings,
      contributions,
      excludedFromMetrics: warningsResult.excludedFromMetrics,
    });
  });

  return parsedTasks;
}

export function computeHsSummary(
  tasks: HsMonthlyGoalTask[],
  config: MonthGoalsConfig
): HsMonthlyGoalsSummary {
  const designerAccumulator = new Map<number, PerformanceAccumulator>();
  const qcAccumulator = new Map<number, PerformanceAccumulator>();
  const combinedAccumulator = new Map<number, CombinedAccumulator>();
  const tasksWithWarnings: HsMonthlyGoalTask[] = [];

  const safeConfig: MonthGoalsConfig = {
    defaultDesignerGoal: config.defaultDesignerGoal ?? DEFAULT_DESIGNER_GOAL,
    defaultQcGoal: config.defaultQcGoal ?? DEFAULT_QC_GOAL,
    memberOverrides: config.memberOverrides ?? {},
  };

  let totalMiles = 0;
  let totalTasks = 0;

  tasks.forEach(task => {
    if (task.warnings.length > 0) {
      tasksWithWarnings.push(task);
    }

    if (task.excludedFromMetrics) {
      return;
    }

    totalTasks += 1;

    task.contributions.forEach(contribution => {
      if (shouldCountMilesInTotals(contribution.type, contribution.miles)) {
        totalMiles += contribution.miles;
      }

      addSharesToAccumulator(contribution.designers, task.id, designerAccumulator);
      addSharesToAccumulator(contribution.qcReviewers, task.id, qcAccumulator);

      contribution.designers.forEach(share => {
        addDesignerShareToCombined(combinedAccumulator, share, contribution, task.id);
      });
    });
  });

  return {
    totalTasks,
    totalDesignPoints: totalMiles,
    totalMiles,
    designerPerformance: toPerformance(
      designerAccumulator,
      safeConfig.defaultDesignerGoal,
      safeConfig.memberOverrides,
      'designerGoal'
    ),
    qcPerformance: toPerformance(
      qcAccumulator,
      safeConfig.defaultQcGoal,
      safeConfig.memberOverrides,
      'qcGoal'
    ),
    combinedProduction: toCombinedProduction(combinedAccumulator),
    tasksWithWarnings,
  };
}
