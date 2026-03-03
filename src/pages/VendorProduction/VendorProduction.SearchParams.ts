import { getCustomField } from '../../utils/tasksFunctions';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { SearchParams } from '../../types/SearchParams';

const asbuiltChecked = getCustomField('ASBUILT CHECKED');
const redesignChecked = getCustomField('REDESIGN CHECKED');
const bauChecked = getCustomField('BAU CHECKED');
const asbuiltBillingStatusField = getCustomField('ASBUILT BILLING STATUS');
const designBillingStatusField = getCustomField('DESIGN BILLING STATUS');
const redesignBillingStatusField = getCustomField('REDESIGN BILLING STATUS');
const designAssigneeField = getCustomField('DESIGN ASSIGNEE');
const bauBillingStatusField = getCustomField('BAU BILLING STATUS');

// Anais Del Valle Archila Gonzalez

export function getAsbuiltSearchParamsForVendor(vendorId: string): SearchParams {
  return {
    page: '0',
    'assignees[]': vendorId,
    'list_ids[]': CLICKUP_LIST_IDS.cciHs,
    include_closed: 'true',
    custom_fields: JSON.stringify([
      {
        field_id: asbuiltBillingStatusField.id,
        operator: 'ANY',
        value: [
          asbuiltBillingStatusField.type_config?.options?.[0].id,
          asbuiltBillingStatusField.type_config?.options?.[1].id,
        ],
      },
      {
        field_id: asbuiltChecked.id,
        operator: 'IS NULL',
      },
    ]),
  };
}

export function getDesignSearchParamsForVendor(vendorId: string): SearchParams {
  // IMPORTANT:
  // We intentionally do NOT send "DESIGN CHECKED IS NULL" to ClickUp here.
  // That combination with DESIGN BILLING STATUS triggers intermittent
  // ClickUp backend errors (500 ITEMV2_003), especially for "DESIGN BILLED".
  // Strategy:
  // 1) Query the smallest reliable server-side set (DESIGN ASSIGNEE + BILLING STATUS)
  // 2) Apply DESIGN CHECKED null filtering in frontend (see filterUncheckedDesignTasks).
  return {
    page: '0',
    'list_ids[]': CLICKUP_LIST_IDS.cciHs,
    include_closed: 'true',
    custom_fields: JSON.stringify([
      {
        field_id: designAssigneeField.id,
        operator: 'ANY',
        value: [vendorId],
      },
      {
        field_id: designBillingStatusField.id,
        operator: 'ANY',
        value: [
          designBillingStatusField.type_config?.options?.[0].id,
          designBillingStatusField.type_config?.options?.[1].id,
        ],
      },
    ]),
  };
}

export function getRedesignSearchParamsForVendor(vendorId: string): SearchParams {
  return {
    page: '0',
    'assignees[]': vendorId,
    'list_ids[]': CLICKUP_LIST_IDS.cciHs,
    include_closed: 'true',
    custom_fields: JSON.stringify([
      {
        field_id: redesignBillingStatusField.id,
        operator: 'ANY',
        value: [
          redesignBillingStatusField.type_config?.options?.[0].id,
          redesignBillingStatusField.type_config?.options?.[1].id,
        ],
      },
      {
        field_id: redesignChecked.id,
        operator: 'IS NULL',
      },
    ]),
  };
}

export function getBAUSearchParamsForVendor(vendorId: string): SearchParams {
  return {
    page: '0',
    'assignees[]': vendorId,
    'list_ids[]': CLICKUP_LIST_IDS.cciBau,
    include_closed: 'true',
    custom_fields: JSON.stringify([
      {
        field_id: bauBillingStatusField.id,
        operator: 'ANY',
        value: [
          bauBillingStatusField.type_config?.options?.[0].id,
          bauBillingStatusField.type_config?.options?.[1].id,
        ],
      },
      {
        field_id: bauChecked.id,
        operator: 'IS NULL',
      },
    ]),
  };
}
