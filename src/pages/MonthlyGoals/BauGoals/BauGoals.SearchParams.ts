import { SearchParams } from '../../../types/SearchParams';
import { getCustomField } from '../../../utils/tasksFunctions';
import { dayjs } from '../../../utils/dayjs';
import { ARGENTINA_TZ, FIELD_ACTUAL_COMPLETION_DATE } from '../MonthlyGoals.constants';

export function getBauGoalsSearchParams(year: number, month: number): SearchParams {
  const fieldId = getCustomField(FIELD_ACTUAL_COMPLETION_DATE, 'bau').id;

  if (!fieldId) {
    throw new Error('ACTUAL COMPLETION DATE field id not found for BAU source.');
  }

  const monthString = String(month).padStart(2, '0');
  const start = dayjs.tz(`${year}-${monthString}-01`, ARGENTINA_TZ).startOf('month');
  const end = start.endOf('month');

  return {
    'statuses[]': ['approved', 'sent'],
    include_closed: 'true',
    custom_fields: JSON.stringify([
      {
        field_id: fieldId,
        operator: 'RANGE',
        value: [start.valueOf(), end.valueOf()],
      },
    ]),
  };
}
