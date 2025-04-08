import { Dayjs } from 'dayjs';
import { SearchParams } from '../../types/SearchParams';
import { getCustomField } from '../../utils/tasksFunctions';

export function createOnChangeHandler(setSearchParams: (params: SearchParams) => void) {
  return function onChange(dates: [Dayjs | null, Dayjs | null] | null) {
    if (!dates || !dates[0] || !dates[1]) return;

    const [startDate, endDate] = dates;
    const startTimestamp = startDate.unix() * 1000;
    const endTimestamp = endDate.unix() * 1000;

    const fieldId = getCustomField('ACTUAL COMPLETION DATE').id;
    const customFields = [
      {
        field_id: fieldId,
        operator: 'RANGE',
        value: [startTimestamp, endTimestamp],
      },
    ];

    setSearchParams({
      'statuses[]': ['approved'],
      custom_fields: JSON.stringify(customFields),
    });
  };
}
