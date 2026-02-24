import { SearchParams } from '../../../types/SearchParams';
import { HS_ACTIVE_STATUSES } from './HsGoals.constants';

export function getHsGoalsSearchParams(): SearchParams {
  return {
    'statuses[]': HS_ACTIVE_STATUSES,
    include_closed: 'true',
  };
}
