import { Dayjs } from 'dayjs';
import { SearchParams } from '../../types/SearchParams';
import { getCustomField } from '../../utils/tasksFunctions';

export function createOnChangeHandler(setSearchParams: (params: SearchParams) => void) {
  return function onChange(dates: [Dayjs | null, Dayjs | null] | null) {
    if (!dates || !dates[0] || !dates[1]) return;

    const [startDate, endDate] = dates;
    const startTimestamp = startDate.unix() * 1000;
    const endTimestamp = endDate.unix() * 1000;

    const fieldId = getCustomField('ACTUAL COMPLETION DATE', 'bau').id;
    const customFields = [
      {
        field_id: fieldId,
        operator: 'RANGE',
        value: [startTimestamp, endTimestamp],
      },
    ];

    setSearchParams({
      'statuses[]': ['approved', 'sent'],
      custom_fields: JSON.stringify(customFields),
    });
  };
}

export function createHsOnChangeHandler(
  setHsSearchParams: (params: SearchParams) => void,
  setRedesignSearchParams: (params: SearchParams) => void
) {
  return function onChange(dates: [Dayjs | null, Dayjs | null] | null) {
    if (!dates || !dates[0] || !dates[1]) return;

    const [startDate, endDate] = dates;
    const startTimestamp = startDate.unix() * 1000;
    const endTimestamp = endDate.unix() * 1000;

    const actualCompletionDateId = getCustomField('ACTUAL COMPLETION DATE', 'hs').id;
    const redesignActualCompletionDateId = getCustomField(
      'REDESIGN ACTUAL COMPLETION DATE',
      'hs'
    ).id;
    const hsCustomFields = [
      {
        field_id: actualCompletionDateId,
        operator: 'RANGE',
        value: [startTimestamp, endTimestamp],
      },
    ];

    const redesignCustomFields = [
      {
        field_id: redesignActualCompletionDateId,
        operator: 'RANGE',
        value: [startTimestamp, endTimestamp],
      },
    ];

    setHsSearchParams({
      'statuses[]': ['sent', 'approved'],
      custom_fields: JSON.stringify(hsCustomFields),
    });

    setRedesignSearchParams({
      'statuses[]': ['redesign sent', 'approved'],
      custom_fields: JSON.stringify(redesignCustomFields),
    });
  };
}
