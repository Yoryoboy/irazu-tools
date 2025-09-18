import type { MQMSTask, NewCustomFieldObject } from '../../types/Task';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { formatString, getNewDropdownCustomFieldObject, getTextCustomFieldObject } from '../../utils/helperFunctions';
import type { Task as SdkTask } from '@yoryoboy/clickup-sdk';
import type { CreateTaskPayload } from '../../lib/clickupSdkAdapter';

export type CustomerCompanyName = 'CCI' | 'TRUENET' | 'TECHSERV';

export function getCustomerCompanyByListId(listId: string): CustomerCompanyName | undefined {
  switch (listId) {
    case CLICKUP_LIST_IDS.cciBau:
      return 'CCI';
    case CLICKUP_LIST_IDS.trueNetBau:
      return 'TRUENET';
    case CLICKUP_LIST_IDS.techservBau:
      return 'TECHSERV';
    default:
      return undefined;
  }
}

export function buildClickUpTaskFromMqms(
  row: MQMSTask,
  customerCompanyName?: CustomerCompanyName
): CreateTaskPayload {
  const [plantTypeUnformatted, projectType, jobType] = row.PROJECT_TYPE.split(' - ');
  const plantType = formatString(plantTypeUnformatted);

  const plantTypeCF = getNewDropdownCustomFieldObject(
    'PLANT TYPE',
    plantType,
    '77b959a3-d6ee-4c4e-8d21-575559a9080a'
  );

  const projectTypeCF = getNewDropdownCustomFieldObject(
    'PROJECT TYPE',
    projectType,
    'ff865e6f-323f-49a0-bad5-9c9b439c8d64'
  );

  const jobTypeCF = getNewDropdownCustomFieldObject(
    'JOB TYPE CCI',
    jobType,
    '81f785fe-7a17-4075-ad7b-29918a6f55ad'
  );

  const secondaryIdCF = getTextCustomFieldObject('SECONDARY ID', row.SECONDARY_EXTERNAL_ID);
  const nodeCF = getTextCustomFieldObject('NODE', row.NODE_NAME);
  const workReqIdCF = getTextCustomFieldObject('WORK REQUEST ID', row.REQUEST_ID);
  const hubCF = getTextCustomFieldObject('HUB', row.HUB);

  const custom_fields: NewCustomFieldObject[] = [
    plantTypeCF,
    projectTypeCF,
    secondaryIdCF,
    jobTypeCF,
    nodeCF,
    workReqIdCF,
    hubCF,
  ];

  if (customerCompanyName) {
    const customerCF = getNewDropdownCustomFieldObject('Customer Company', customerCompanyName, 'null');
    custom_fields.push(customerCF);
  }

  return {
    name: row.EXTERNAL_ID,
    description: row.JOB_NAME,
    custom_fields: custom_fields.map(cf => ({ id: cf.id, value: cf.value })),
  };
}

// Extract a Set of WORK REQUEST ID values present in ClickUp tasks
export function extractWorkRequestIds(tasks: SdkTask[]): Set<string> {
  const set = new Set<string>();
  for (const t of tasks) {
    // reduced is a flattened object with only defined custom fields
    const reduced = t.reduceInfo() as Record<string, unknown>;
    const value = reduced['WORK REQUEST ID'];
    if (typeof value === 'string' && value.length > 0) {
      set.add(value);
    }
  }
  return set;
}
