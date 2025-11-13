import {
  ApprovedBauTasks,
  BauIncomeData,
  BulkTasksTimeStatus,
  CustomField,
  ExtractedTaskFieldValues,
  FulfilledPostNewTaskResult,
  MQMSTask,
  newTimeEntryPayload,
  PostNewTaskResult,
  RejectedPostNewTaskResult,
  Task,
  User,
} from '../types/Task';

import {
  formatString,
  getNewDropdownCustomFieldObject,
  getTextCustomFieldObject,
} from './helperFunctions';

import {
  CLICKUP_BAU_CUSTOM_FIELDS,
  CLICKUP_HS_CUSTOM_FIELDS,
} from '../constants/clickUpCustomFields';
import { SearchParams } from '../types/SearchParams';
import { TaskTimeData, TaskTimeDataWithClickUpID } from '../types/MQMS';
import { CLICKUP_LIST_IDS } from './config';

const apikey = import.meta.env.VITE_CLICKUP_API_AKEY;

// Helper function to format assignee usernames
function formatAssigneeNames(assignees?: User[]): string {
  return (
    assignees
      ?.map(assignee => assignee.username)
      .filter(Boolean)
      .join(', ') ?? ''
  );
}

// Map listId to the "Customer Company" dropdown option name
const LIST_ID_TO_CUSTOMER_COMPANY: Record<string, 'CCI' | 'TRUENET' | 'TECHSERV'> = {
  [CLICKUP_LIST_IDS.cciBau]: 'CCI',
  [CLICKUP_LIST_IDS.trueNetBau]: 'TRUENET',
  [CLICKUP_LIST_IDS.techservBau]: 'TECHSERV',
};

export function getNewTasksFromMqms(MQMSTasks: MQMSTask[], clickUpTasks: Task[]): MQMSTask[] {
  const clickUpTasksUUID = clickUpTasks.map(task => {
    return task.custom_fields?.find(field => field.name === 'WORK REQUEST ID')?.value;
  });

  const newMqmsTasks = MQMSTasks.filter(task => {
    const existsInClickUp = clickUpTasksUUID.includes(task.REQUEST_ID);
    return !existsInClickUp;
  });

  return newMqmsTasks;
}

export async function postNewTasks(
  newTasks: Task[],
  listId: string,
  apikey: string
): Promise<PostNewTaskResult[]> {
  const results = await Promise.allSettled(
    newTasks.map(task =>
      fetch(`https://api.clickup.com/api/v2/list/${listId}/task?`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apikey,
        },
        body: JSON.stringify(task),
      })
        .then(resp => {
          if (!resp.ok) {
            throw new Error(`Error creating task ${task.name}: ${resp.statusText}`);
          }
          return resp.json();
        })
        .then(data => ({
          taskName: task.name,
          status: 'success',
          clickUpTaskId: data.id,
        }))
    )
  );

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return {
        status: 'fulfilled',
        value: result.value,
      } as FulfilledPostNewTaskResult;
    } else {
      return {
        status: 'rejected',
        reason: result.reason,
      } as RejectedPostNewTaskResult;
    }
  });
}

export function getNewTask(
  row: MQMSTask,
  customerCompanyName?: 'CCI' | 'TRUENET' | 'TECHSERV'
): Task {
  const [plantTypeUnformatted, projectType, jobType] = row.PROJECT_TYPE.split(' - ');
  const plantType = formatString(plantTypeUnformatted);

  const plantTypeCustomFieldValue = getNewDropdownCustomFieldObject(
    'PLANT TYPE',
    plantType,
    '77b959a3-d6ee-4c4e-8d21-575559a9080a'
  );

  const projectTypeCustomFieldValue = getNewDropdownCustomFieldObject(
    'PROJECT TYPE',
    projectType,
    'ff865e6f-323f-49a0-bad5-9c9b439c8d64'
  );

  const jobTypeCustomFieldValue = getNewDropdownCustomFieldObject(
    'JOB TYPE CCI',
    jobType,
    '81f785fe-7a17-4075-ad7b-29918a6f55ad'
  );

  const secondaryIdCustomFieldValue = getTextCustomFieldObject(
    'SECONDARY ID',
    row.SECONDARY_EXTERNAL_ID
  );

  const nodeNameCustomFieldValue = getTextCustomFieldObject('NODE', row.NODE_NAME);

  const workRequestCustomFieldValue = getTextCustomFieldObject('WORK REQUEST ID', row.REQUEST_ID);

  const hubCustomFieldValue = getTextCustomFieldObject('HUB', row.HUB);

  const customFields = [
    plantTypeCustomFieldValue,
    projectTypeCustomFieldValue,
    secondaryIdCustomFieldValue,
    jobTypeCustomFieldValue,
    nodeNameCustomFieldValue,
    workRequestCustomFieldValue,
    hubCustomFieldValue,
  ];

  // Include Customer Company only when a valid option name is provided (BAU lists)
  if (customerCompanyName) {
    const customerCompanyCustomFieldValue = getNewDropdownCustomFieldObject(
      'Customer Company',
      customerCompanyName,
      'null'
    );
    customFields.push(customerCompanyCustomFieldValue);
  }

  return {
    name: row.EXTERNAL_ID,
    description: row.JOB_NAME,
    custom_fields: customFields,
  };
}

export const updateNewMqmsTasks = (newTaskName: string, newMqmsTasks: MQMSTask[]) =>
  newMqmsTasks.filter(task => task.EXTERNAL_ID !== newTaskName);

export const handleAction = async (
  row: MQMSTask,
  newMqmsTasks: MQMSTask[],
  setMQMSTasks: (tasks: MQMSTask[]) => void,
  listId: string
) => {
  const customerCompanyName = LIST_ID_TO_CUSTOMER_COMPANY[listId];
  const newTask: Task[] = [getNewTask(row, customerCompanyName)];
  console.log(newTask);
  const results = await postNewTasks(newTask, listId, apikey);

  const successfulTasks = results.filter(
    (result): result is FulfilledPostNewTaskResult => result.status === 'fulfilled'
  );

  if (successfulTasks.length > 0) {
    setMQMSTasks(updateNewMqmsTasks(successfulTasks[0].value.taskName, newMqmsTasks));
  }

  const failedTasks = results.filter(result => result.status === 'rejected');
  if (failedTasks.length > 0) {
    console.error('Error procesando tareas:', failedTasks);
  }
};

export const handleSyncAll = async (
  newMqmsTasks: MQMSTask[],
  setMQMSTasks: (tasks: MQMSTask[]) => void,
  listId: string
) => {
  const customerCompanyName = LIST_ID_TO_CUSTOMER_COMPANY[listId];
  const allNewTasks = newMqmsTasks.map(row => getNewTask(row, customerCompanyName));
  const results = await postNewTasks(allNewTasks, listId, apikey);

  const successfulTasks = results.filter(
    (result): result is FulfilledPostNewTaskResult => result.status === 'fulfilled'
  );

  if (successfulTasks.length > 0) {
    const updatedTasks = newMqmsTasks.filter(
      task => !successfulTasks.some(success => success.value.taskName === task.EXTERNAL_ID)
    );
    setMQMSTasks(updatedTasks);
  }

  const failedTasks = results.filter(result => result.status === 'rejected');
  if (failedTasks.length > 0) {
    console.error('Error procesando tareas:', failedTasks);
  }
};

export async function fetchFilteredTasks(
  teamId: string,
  searchParams: SearchParams,
  apiKey: string
): Promise<Task[]> {
  const query = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => query.append(key, item));
    } else {
      query.append(key, value);
    }
  });
  const queryString = query.toString();

  try {
    const response = await fetch(
      `https://api.clickup.com/api/v2/team/${teamId}/task?${queryString}`,
      {
        method: 'GET',
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error fetching data: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const { tasks } = data;
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

export type CustomFieldSource = 'hs' | 'bau';

export function getCustomField(
  fieldName: string,
  preferredSource: CustomFieldSource | null = null
): CustomField {
  const sources =
    preferredSource === 'bau'
      ? [CLICKUP_BAU_CUSTOM_FIELDS, CLICKUP_HS_CUSTOM_FIELDS]
      : [CLICKUP_HS_CUSTOM_FIELDS, CLICKUP_BAU_CUSTOM_FIELDS];

  const foundField = sources
    .map(source => source.fields.find(field => field.name === fieldName))
    .find((field): field is CustomField => Boolean(field));

  if (!foundField) {
    throw new Error("Field with name '" + fieldName + "' not found");
  }

  return foundField;
}

export function getTimeSpentInStatusPayloads(
  validStatuses: string[],
  timeStatus: BulkTasksTimeStatus[],
  extractedTaskFieldValues: ExtractedTaskFieldValues[]
): newTimeEntryPayload[] {
  const payloads: Partial<newTimeEntryPayload>[] = timeStatus
    .map(task => {
      const clickUpID = task.task_id;
      const partialPayload = task.status_history
        .flat()
        .filter(status => validStatuses.includes(status.status))
        .map(time => {
          return {
            clickUpID,
            start: Number(time.total_time.since),
            duration: time.total_time.by_minute * 60000,
            status: time.status,
          };
        });

      return partialPayload;
    })
    .flat();

  const payloadWithQcer = addQcerToTaskByStatus(payloads, extractedTaskFieldValues);

  const QcPayloads = payloadWithQcer.map(payload => {
    return {
      ...payload,
      tags: [
        {
          name: 'qc time',
          tag_bg: '#e93d82',
          tag_fg: '#e93d82',
        },
      ],
    } as newTimeEntryPayload;
  });

  return QcPayloads;
}

function addQcerToTaskByStatus(
  payloads: Partial<newTimeEntryPayload>[],
  extractedTaskFieldValues: ExtractedTaskFieldValues[]
): Partial<newTimeEntryPayload>[] {
  const payloadWithQcer: Partial<newTimeEntryPayload>[] = payloads.map(payload => {
    const taskField = extractedTaskFieldValues.find(
      t => t.id === payload.clickUpID
    ) as ExtractedTaskFieldValues;

    switch (payload.status) {
      case 'asbuilt in qc by irazu':
        return {
          ...payload,
          assignee: (taskField['PREASBUILT QC BY'] as number[])?.[0] || 0,
        };

      case 'design in qc by irazu':
        return {
          ...payload,
          assignee: (taskField['DESIGN QC BY'] as number[])?.[0] || 0,
        };

      case 'redesign in qc by irazu':
        return {
          ...payload,
          assignee: (taskField['REDESIGN QC BY'] as number[])?.[0] || 0,
        };

      case 'internal qc':
        return {
          ...payload,
          assignee: (taskField['QC PERFORMED BY'] as number[])?.[0] || 0,
        };

      default:
        return payload;
    }
  });

  return payloadWithQcer;
}

export function checkMissingWorkRequestID(tasks: Task[]): boolean {
  return tasks.length > 0
    ? tasks.some(task => {
        const workRequestID = task?.custom_fields?.find(field => field.name === 'WORK REQUEST ID');

        if (!workRequestID?.value) {
          console.log(`Missing Work Request ID for task ${task.name}`);
        }

        return !workRequestID?.value;
      })
    : true;
}

export function getMQMSTaskTimetrackerWithID(
  MQMSTasksTimetracker: TaskTimeData[],
  tasks: ExtractedTaskFieldValues[],
  filteredTasks: Task[]
): TaskTimeDataWithClickUpID[] {
  return MQMSTasksTimetracker.map(task => {
    const sentTask = tasks.find(sentTask => sentTask['WORK REQUEST ID'] === task.taskUuid);
    return { ...task, clickUpID: sentTask?.id?.toString() as string };
  }).map(task => {
    const sentTask = filteredTasks.find(sentTask => sentTask.id === task.clickUpID);
    return { ...task, assignee: sentTask?.assignees?.[0]?.id as number };
  });
}

export function formatApprovedBauTasks(tasks: Task[]): ApprovedBauTasks[] {
  const UNIT_TYPES = ['(EA)', '(FT)', '(HR)', '(MILE)'];
  const CUSTOM_FIELD_NAMES = ['QC PERFORMED BY'];

  return tasks.map(task => {
    const designers = formatAssigneeNames(task?.assignees);

    const receivedDate = task?.custom_fields?.find(field => field.name === 'RECEIVED DATE')
      ?.value as string;
    const completionDate = task?.custom_fields?.find(
      field => field.name === 'ACTUAL COMPLETION DATE'
    )?.value as string;
    const customFields = task?.custom_fields?.filter(
      field =>
        (field.type === 'number' &&
          field.value &&
          UNIT_TYPES.some(unit => field.name?.includes(unit))) ||
        (CUSTOM_FIELD_NAMES.includes(field?.name as string) && field.value)
    ) as CustomField[];

    return {
      designers,
      id: task.id as string,
      name: task.name,
      receivedDate: new Date(Number(receivedDate)).toLocaleDateString(),
      completionDate: new Date(Number(completionDate)).toLocaleDateString(),
      customFields,
    };
  });
}

export function formatApprovedHsTasks(tasks: Task[]): ApprovedBauTasks[] {
  return tasks.map(task => {
    const designersFromAssignees = formatAssigneeNames(task?.assignees);

    const designAssignee = task?.custom_fields?.find(field => field.name === 'DESIGN ASSIGNEE')
      ?.value as User[];
    const designersFromCustomField = formatAssigneeNames(designAssignee);

    const designers = designersFromAssignees || designersFromCustomField;

    const receivedDate = task?.custom_fields?.find(field => field.name === 'RECEIVED DATE')
      ?.value as string;

    const isDesign = task?.custom_fields?.find(field => field.name === 'PROJECT TYPE')?.value === 0;

    const completionDate = isDesign
      ? (task?.custom_fields?.find(field => field.name === 'ACTUAL COMPLETION DATE')
          ?.value as string)
      : (task?.custom_fields?.find(field => field.name === 'REDESIGN ACTUAL COMPLETION DATE')
          ?.value as string);

    // Fields that represent billable codes (with prices)
    const billableCodeNames = [
      'ASBUILT ROUNDED MILES',
      'DESIGN ROUNDED MILES',
      'REDESIGN TIME',
    ];

    // Fields needed for QC lookup and billing status
    const supportFieldNames = [
      'REDESIGN QC BY',
      'PREASBUILT QC BY',
      'DESIGN QC BY',
      'ASBUILT BILLING STATUS',
    ];

    const customFields = task?.custom_fields?.filter(
      field =>
        (billableCodeNames.includes(field.name as string) && field.value) ||
        supportFieldNames.includes(field.name as string)
    ) as CustomField[];

    return {
      designers,
      id: task.id as string,
      name: task.name,
      receivedDate: new Date(Number(receivedDate)).toLocaleDateString(),
      completionDate: new Date(Number(completionDate)).toLocaleDateString(),
      customFields,
    };
  });
}

// Helper function to extract QC usernames from custom field value
function getQcUsernames(value: CustomField['value']): string {
  if (!Array.isArray(value) || value.length === 0) {
    return 'QC NO ASIGNADO';
  }

  const usernames = value
    .map(user => (user as User | undefined)?.username)
    .filter((username): username is string => Boolean(username));

  return usernames.length ? usernames.join(', ') : 'QC NO ASIGNADO';
}

export function formatBauIncomeDataForExcel<T extends Record<string, number>>(
  tasks: ApprovedBauTasks[],
  prices: T
): BauIncomeData[] {
  const priceKeys = new Set(Object.keys(prices));

  return tasks.reduce<BauIncomeData[]>((acc, task) => {
    // Get QC once per task (applies to all codes in BAU)
    const qcField = task.customFields?.find(field => field.name === 'QC PERFORMED BY');
    const qcBy = getQcUsernames(qcField?.value);

    task.customFields?.forEach(code => {
      // Skip non-numeric fields (like QC PERFORMED BY itself)
      if (code.type !== 'number') {
        return;
      }

      const quantity = Number(code.value);
      if (!Number.isFinite(quantity) || quantity === 0) {
        return;
      }

      const codeName = code.name;
      if (!codeName || !priceKeys.has(codeName)) {
        return;
      }

      const price = prices[codeName as keyof T] || 0;

      acc.push({
        id: task.id,
        name: task.name,
        designers: task.designers,
        qcBy,
        receivedDate: task.receivedDate ? new Date(task.receivedDate) : null,
        completionDate: task.completionDate ? new Date(task.completionDate) : null,
        code: codeName,
        quantity,
        price,
        total: quantity * price,
      });
    });
    return acc;
  }, []);
}

export function formatHsIncomeDataForExcel<T extends Record<string, number>>(
  tasks: ApprovedBauTasks[],
  prices: T
): BauIncomeData[] {
  // Map code names to their corresponding QC field names (HS-specific logic)
  const qcFieldNameByCode: Record<string, string> = {
    'ASBUILT ROUNDED MILES': 'PREASBUILT QC BY',
    'DESIGN ROUNDED MILES': 'DESIGN QC BY',
    'REDESIGN TIME': 'REDESIGN QC BY',
  };

  const priceKeys = new Set(Object.keys(prices));

  return tasks.reduce<BauIncomeData[]>((acc, task) => {
    const lookupField = (name: string) => task.customFields?.find(field => field.name === name);

    // Check if ASBUILT BILLING STATUS is 2 (exclude ASBUILT ROUNDED MILES if true)
    const billingStatus = lookupField('ASBUILT BILLING STATUS');
    const shouldExcludeAsbuilt = billingStatus?.value === 2;

    task.customFields?.forEach(code => {
      const codeName = code.name;

      // Skip ASBUILT ROUNDED MILES if billing status is 2
      if (shouldExcludeAsbuilt && codeName === 'ASBUILT ROUNDED MILES') {
        return;
      }

      const quantity = Number(code.value);
      if (!Number.isFinite(quantity) || quantity === 0) {
        return;
      }

      if (!codeName || !priceKeys.has(codeName)) {
        return;
      }

      const price = prices[codeName as keyof T] || 0;

      // Get QC specific to this code/phase (HS-specific logic)
      const qcFieldName = qcFieldNameByCode[codeName];
      const qcField = qcFieldName ? lookupField(qcFieldName) : undefined;
      const qcBy = qcField ? getQcUsernames(qcField.value) : undefined;

      acc.push({
        id: task.id,
        name: task.name,
        designers: task.designers,
        qcBy,
        receivedDate: task.receivedDate ? new Date(task.receivedDate) : null,
        completionDate: task.completionDate ? new Date(task.completionDate) : null,
        code: codeName,
        quantity,
        price,
        total: quantity * price,
      });
    });
    return acc;
  }, []);
}
