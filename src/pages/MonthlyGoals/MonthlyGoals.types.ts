export interface MemberShare {
  memberId: number;
  memberName: string;
  points: number;
}

export interface MonthlyGoalTask {
  id: string;
  name: string;
  completionDate: Date | null;
  designPoints: number | null;
  designers: MemberShare[];
  qcReviewers: MemberShare[];
  warnings: string[];
}

export interface MemberPerformance {
  memberId: number;
  memberName: string;
  totalPoints: number;
  taskCount: number;
  goal: number;
  progressPercent: number;
}

export interface MonthlyGoalsSummary {
  totalTasks: number;
  totalDesignPoints: number;
  designerPerformance: MemberPerformance[];
  qcPerformance: MemberPerformance[];
  tasksWithWarnings: MonthlyGoalTask[];
}

export type HsWorkType = 'asbuilt' | 'design' | 'redesign';

export interface HsWorkContribution {
  type: HsWorkType;
  completionDate: Date | null;
  miles: number | null;
  designers: MemberShare[];
  qcReviewers: MemberShare[];
}

export interface HsMonthlyGoalTask extends MonthlyGoalTask {
  contributions: HsWorkContribution[];
  excludedFromMetrics: boolean;
}

export interface CombinedProductionMember {
  memberId: number;
  memberName: string;
  asbuiltMiles: number;
  designMiles: number;
  redesignMiles: number;
  totalMiles: number;
  taskCount: number;
}

export interface HsMonthlyGoalsSummary extends MonthlyGoalsSummary {
  totalMiles: number;
  combinedProduction: CombinedProductionMember[];
}

export interface MonthGoalsConfig {
  defaultDesignerGoal: number;
  defaultQcGoal: number;
  memberOverrides: Record<
    number,
    {
      designerGoal?: number;
      qcGoal?: number;
    }
  >;
}

export interface GoalsConfig {
  [monthKey: string]: MonthGoalsConfig;
}
