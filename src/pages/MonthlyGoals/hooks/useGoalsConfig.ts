import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_DESIGNER_GOAL,
  DEFAULT_QC_GOAL,
  GOALS_STORAGE_KEY,
} from '../MonthlyGoals.constants';
import { GoalsConfig, MonthGoalsConfig } from '../MonthlyGoals.types';

const DEFAULT_MONTH_CONFIG: MonthGoalsConfig = {
  defaultDesignerGoal: DEFAULT_DESIGNER_GOAL,
  defaultQcGoal: DEFAULT_QC_GOAL,
  memberOverrides: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toValidNumber(value: unknown, fallback: number): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

function getDefaultMonthConfig(): MonthGoalsConfig {
  return DEFAULT_MONTH_CONFIG;
}

function normalizeMonthGoalsConfig(value: unknown): MonthGoalsConfig {
  const fallback = getDefaultMonthConfig();

  if (!isRecord(value)) {
    return fallback;
  }

  const defaultDesignerGoal = toValidNumber(
    value.defaultDesignerGoal,
    fallback.defaultDesignerGoal
  );
  const defaultQcGoal = toValidNumber(value.defaultQcGoal, fallback.defaultQcGoal);

  const overridesRaw = isRecord(value.memberOverrides) ? value.memberOverrides : {};
  const memberOverrides: MonthGoalsConfig['memberOverrides'] = {};

  Object.entries(overridesRaw).forEach(([memberId, memberValue]) => {
    if (!isRecord(memberValue)) {
      return;
    }

    const normalizedMember: { designerGoal?: number; qcGoal?: number } = {};

    if (memberValue.designerGoal !== undefined) {
      const designerGoal = toValidNumber(memberValue.designerGoal, NaN);
      if (Number.isFinite(designerGoal)) {
        normalizedMember.designerGoal = designerGoal;
      }
    }

    if (memberValue.qcGoal !== undefined) {
      const qcGoal = toValidNumber(memberValue.qcGoal, NaN);
      if (Number.isFinite(qcGoal)) {
        normalizedMember.qcGoal = qcGoal;
      }
    }

    if (Object.keys(normalizedMember).length > 0) {
      memberOverrides[Number(memberId)] = normalizedMember;
    }
  });

  return {
    defaultDesignerGoal,
    defaultQcGoal,
    memberOverrides,
  };
}

function normalizeGoalsConfig(value: unknown): GoalsConfig {
  if (!isRecord(value)) {
    return {};
  }

  const normalized: GoalsConfig = {};

  Object.entries(value).forEach(([monthKey, monthValue]) => {
    normalized[monthKey] = normalizeMonthGoalsConfig(monthValue);
  });

  return normalized;
}

function readStoredGoalsConfig(): GoalsConfig {
  if (typeof window === 'undefined') {
    return {};
  }

  const rawValue = window.localStorage.getItem(GOALS_STORAGE_KEY);
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);
    return normalizeGoalsConfig(parsed);
  } catch {
    return {};
  }
}

function mergeGoalsConfig(baseConfig: GoalsConfig, importedConfig: GoalsConfig): GoalsConfig {
  const merged = { ...baseConfig };

  Object.entries(importedConfig).forEach(([monthKey, importedMonthConfig]) => {
    const existingMonthConfig = merged[monthKey] ?? getDefaultMonthConfig();

    merged[monthKey] = {
      defaultDesignerGoal: importedMonthConfig.defaultDesignerGoal,
      defaultQcGoal: importedMonthConfig.defaultQcGoal,
      memberOverrides: {
        ...existingMonthConfig.memberOverrides,
        ...importedMonthConfig.memberOverrides,
      },
    };
  });

  return merged;
}

export function useGoalsConfig() {
  const [goalsConfig, setGoalsConfig] = useState<GoalsConfig>(() => readStoredGoalsConfig());

  useEffect(() => {
    window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goalsConfig));
  }, [goalsConfig]);

  const getMonthConfig = useCallback(
    (monthKey: string): MonthGoalsConfig => {
      return goalsConfig[monthKey] ?? getDefaultMonthConfig();
    },
    [goalsConfig]
  );

  const setMonthConfig = useCallback((monthKey: string, monthConfig: MonthGoalsConfig) => {
    const normalizedConfig = normalizeMonthGoalsConfig(monthConfig);

    setGoalsConfig(prevConfig => ({
      ...prevConfig,
      [monthKey]: normalizedConfig,
    }));
  }, []);

  const exportConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(goalsConfig, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'irazu-goals-config.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }, [goalsConfig]);

  const importConfig = useCallback(async (file: File) => {
    const fileText = await file.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(fileText) as unknown;
    } catch {
      throw new Error('The selected file is not valid JSON.');
    }

    const normalizedImportedConfig = normalizeGoalsConfig(parsed);

    if (Object.keys(normalizedImportedConfig).length === 0) {
      throw new Error('The selected file does not contain a valid goals configuration.');
    }

    setGoalsConfig(prevConfig => mergeGoalsConfig(prevConfig, normalizedImportedConfig));

    return Object.keys(normalizedImportedConfig).length;
  }, []);

  return {
    goalsConfig,
    getMonthConfig,
    setMonthConfig,
    exportConfig,
    importConfig,
  };
}
