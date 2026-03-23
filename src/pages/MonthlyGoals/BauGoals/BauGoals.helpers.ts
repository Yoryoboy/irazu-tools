import { Task, User } from '../../../types/Task';
import {
  DEFAULT_DESIGNER_GOAL,
  DEFAULT_QC_GOAL,
  FIELD_ACTUAL_COMPLETION_DATE,
  FIELD_DESIGN_POINTS,
  FIELD_QC_PERFORMED_BY,
  ARGENTINA_TZ,
} from '../MonthlyGoals.constants';
import {
  MemberPerformance,
  MemberShare,
  MonthGoalsConfig,
  MonthlyGoalTask,
  MonthlyGoalsSummary,
} from '../MonthlyGoals.types';
import { dayjs } from '../../../utils/dayjs';

interface PerformanceAccumulator {
  memberId: number;
  memberName: string;
  totalPoints: number;
  taskIds: Set<string>;
}

function getCustomFieldValue(task: Task, fieldName: string): unknown {
  return task.custom_fields?.find(field => field.name === fieldName)?.value;
}

function asValidUser(user: unknown): User | null {
  if (typeof user !== 'object' || user === null) {
    return null;
  }

  const maybeUser = user as User;

  if (!maybeUser.id) {
    return null;
  }

  return maybeUser;
}

function getNormalizedTaskUsers(users: unknown): User[] {
  if (!Array.isArray(users)) {
    return [];
  }

  return users
    .map(asValidUser)
    .filter((user): user is User => user !== null);
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

function getDesignPoints(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toMemberShares(users: User[], points: number | null): MemberShare[] {
  if (points === null || users.length === 0) {
    return [];
  }

  const splitPoints = points / users.length;

  return users.map(user => ({
    memberId: user.id as number,
    memberName: getMemberName(user),
    points: splitPoints,
  }));
}

function buildTaskWarnings(
  task: Task,
  completionDate: Date | null,
  designPointsValue: unknown,
  designers: User[],
  qcReviewers: User[]
): string[] {
  const warnings: string[] = [];

  const completionFieldValue = getCustomFieldValue(task, FIELD_ACTUAL_COMPLETION_DATE);
  if (completionFieldValue === null || completionFieldValue === undefined || !completionDate) {
    warnings.push(`Missing ${FIELD_ACTUAL_COMPLETION_DATE}`);
  }

  if (designPointsValue === null || designPointsValue === undefined) {
    warnings.push(`Missing ${FIELD_DESIGN_POINTS}`);
  } else if (!Number.isFinite(Number(designPointsValue))) {
    warnings.push(`Invalid ${FIELD_DESIGN_POINTS}`);
  }

  if (designers.length === 0) {
    warnings.push('Missing assignees');
  }

  if (qcReviewers.length === 0) {
    warnings.push(`Missing ${FIELD_QC_PERFORMED_BY}`);
  }

  return warnings;
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

export function parseGoalTasks(tasks: Task[]): MonthlyGoalTask[] {
  return tasks.map(task => {
    const taskId = task.id ?? task.custom_id ?? task.name;

    const completionDate = getDateValue(getCustomFieldValue(task, FIELD_ACTUAL_COMPLETION_DATE));
    const designPointsRaw = getCustomFieldValue(task, FIELD_DESIGN_POINTS);
    const designPoints = getDesignPoints(designPointsRaw);

    const designers = getNormalizedTaskUsers(task.assignees);
    const qcReviewers = getNormalizedTaskUsers(
      getCustomFieldValue(task, FIELD_QC_PERFORMED_BY)
    );

    return {
      id: taskId,
      name: task.name,
      completionDate,
      designPoints,
      designers: toMemberShares(designers, designPoints),
      qcReviewers: toMemberShares(qcReviewers, designPoints),
      warnings: buildTaskWarnings(task, completionDate, designPointsRaw, designers, qcReviewers),
    };
  });
}

export function computeSummary(
  tasks: MonthlyGoalTask[],
  config: MonthGoalsConfig
): MonthlyGoalsSummary {
  const designerAccumulator = new Map<number, PerformanceAccumulator>();
  const qcAccumulator = new Map<number, PerformanceAccumulator>();
  const tasksWithWarnings: MonthlyGoalTask[] = [];

  const safeConfig: MonthGoalsConfig = {
    defaultDesignerGoal: config.defaultDesignerGoal ?? DEFAULT_DESIGNER_GOAL,
    defaultQcGoal: config.defaultQcGoal ?? DEFAULT_QC_GOAL,
    memberOverrides: config.memberOverrides ?? {},
  };

  let totalDesignPoints = 0;

  tasks.forEach(task => {
    if (task.designPoints !== null) {
      totalDesignPoints += task.designPoints;
    }

    if (task.warnings.length > 0) {
      tasksWithWarnings.push(task);
    }

    addSharesToAccumulator(task.designers, task.id, designerAccumulator);
    addSharesToAccumulator(task.qcReviewers, task.id, qcAccumulator);
  });

  return {
    totalTasks: tasks.length,
    totalDesignPoints,
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
    tasksWithWarnings,
  };
}
