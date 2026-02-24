import { SearchParams } from '../../../types/SearchParams';
import { getCustomField } from '../../../utils/tasksFunctions';
import { dayjs } from '../../../utils/dayjs';
import { ARGENTINA_TZ } from '../MonthlyGoals.constants';
import { HS_ACTIVE_STATUSES } from './HsGoals.constants';
import {
  FIELD_ACTUAL_COMPLETION_DATE,
  FIELD_PREASBUILT_COMPLETION_DATE,
  FIELD_REDESIGN_COMPLETION_DATE,
} from './HsGoals.constants';

interface HsGoalsSearchParams {
  asbuilt: SearchParams;
  design: SearchParams;
  redesign: SearchParams;
}

function getMonthRange(year: number, month: number): [number, number] {
  const monthString = String(month).padStart(2, '0');
  const startOfMonth = dayjs.tz(`${year}-${monthString}-01`, ARGENTINA_TZ).startOf('month');
  const endOfMonth = startOfMonth.endOf('month');

  return [startOfMonth.valueOf(), endOfMonth.valueOf()];
}

function createRangeFilter(fieldId: string, range: [number, number]) {
  return JSON.stringify([
    {
      field_id: fieldId,
      operator: 'RANGE',
      value: range,
    },
  ]);
}

export function getHsGoalsSearchParams(year: number, month: number): HsGoalsSearchParams {
  const asbuiltFieldId = getCustomField(FIELD_PREASBUILT_COMPLETION_DATE, 'hs').id;
  const designFieldId = getCustomField(FIELD_ACTUAL_COMPLETION_DATE, 'hs').id;
  const redesignFieldId = getCustomField(FIELD_REDESIGN_COMPLETION_DATE, 'hs').id;

  if (!asbuiltFieldId || !designFieldId || !redesignFieldId) {
    throw new Error('HS completion date field id not found.');
  }

  const range = getMonthRange(year, month);
  const baseParams: SearchParams = {
    'statuses[]': HS_ACTIVE_STATUSES,
    include_closed: 'true',
  };

  return {
    asbuilt: {
      ...baseParams,
      custom_fields: createRangeFilter(asbuiltFieldId, range),
    },
    design: {
      ...baseParams,
      custom_fields: createRangeFilter(designFieldId, range),
    },
    redesign: {
      ...baseParams,
      custom_fields: createRangeFilter(redesignFieldId, range),
    },
  };
}
