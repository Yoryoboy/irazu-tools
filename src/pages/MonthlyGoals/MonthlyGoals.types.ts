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
