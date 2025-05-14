import {
  ApprovedBauTasks,
  BauIncomeData,
  BulkTasksTimeStatus,
  CustomField,
  ExtractedTaskFieldValues,
  FulfilledPostNewTaskResult,
  MQMSTask,
  newTimeEntryPayload,
  ParsedData,
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
import { createTask } from './clickUpApi';
import { SearchParams } from '../types/SearchParams';
import { TaskTimeData, TaskTimeDataWithClickUpID } from '../types/MQMS';

// Ya no necesitamos importar la API key aquí, se maneja en clickUpApi.ts

export function getNewTasksFromMqms(MQMSTasks: MQMSTask[], clickUpTasks: Task[]): MQMSTask[] {
  const clickUpTaskMap = new Map<string, string>();

  clickUpTasks.forEach(task => {
    const secondaryIdField = task.custom_fields?.find(field => field.name === 'SECONDARY ID');
    const secondaryId = typeof secondaryIdField?.value === 'string' ? secondaryIdField?.value : '';

    if (secondaryId) {
      clickUpTaskMap.set(task.name, secondaryId);
    }
  });

  const newMqmsTasks = MQMSTasks.filter(task => {
    const existsInClickUp =
      clickUpTaskMap.has(task.EXTERNAL_ID) &&
      clickUpTaskMap.get(task.EXTERNAL_ID) === task.SECONDARY_EXTERNAL_ID;
    return !existsInClickUp;
  });

  return newMqmsTasks;
}

export async function postNewTasks(
  newTasks: Task[],
  listId: string
): Promise<PostNewTaskResult[]> {
  const results = await Promise.allSettled(
    newTasks.map(async (task) => {
      const result = await createTask(task, listId);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(`Error creating task ${task.name}: ${result.error.message}`);
      }
    })
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

export function getNewTask(row: MQMSTask): Task {
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

  return {
    name: row.EXTERNAL_ID,
    description: row.JOB_NAME,
    priority: row['MASTER PROJECT NAME'] === "RAPID BUILD" ? 1 : null,
    custom_fields: customFields,
  };
}

export const updateNewMqmsTasks = (newTaskName: string, newMqmsTasks: MQMSTask[]) =>
  newMqmsTasks.filter(task => task.EXTERNAL_ID !== newTaskName);

export const handleAction = async (
  row: MQMSTask,
  listId: string
) => {
  const newTask: Task[] = [getNewTask(row)];
  console.log(newTask);
  const results = await postNewTasks(newTask, listId);

  const successfulTasks = results.filter(
    (result): result is FulfilledPostNewTaskResult => result.status === 'fulfilled'
  );

  const failedTasks = results.filter(result => result.status === 'rejected');
  if (failedTasks.length > 0) {
    console.error('Error procesando tareas:', failedTasks);
  }
  
  // Devolver los resultados para que el componente pueda decidir qué hacer
  return {
    success: successfulTasks.length > 0,
    taskId: successfulTasks.length > 0 ? successfulTasks[0].value.taskName : null,
    results
  };
};

export const handleSyncAll = async (
  newMqmsTasks: MQMSTask[],
  listId: string
) => {
  const allNewTasks = newMqmsTasks.map(row => getNewTask(row));
  const results = await postNewTasks(allNewTasks, listId);

  const successfulTasks = results.filter(
    (result): result is FulfilledPostNewTaskResult => result.status === 'fulfilled'
  );

  const failedTasks = results.filter(result => result.status === 'rejected');
  if (failedTasks.length > 0) {
    console.error('Error procesando tareas:', failedTasks);
  }
  
  // Devolver los resultados para que el componente pueda decidir qué hacer
  return {
    success: successfulTasks.length > 0,
    syncedTaskIds: successfulTasks.map(success => success.value.taskName),
    results
  };
};

export async function fetchFilteredTasks(
  teamId: string,
  searchParams: SearchParams,
  apiKey: string
): Promise<Task[]> {
  const query = new URLSearchParams(searchParams).toString();

  try {
    const response = await fetch(`https://api.clickup.com/api/v2/team/${teamId}/task?${query}`, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
      },
    });

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

export function cleanData(rawData: ParsedData[], desiredKeys: (keyof MQMSTask)[]): MQMSTask[] {
  return rawData.map(
    obj =>
      desiredKeys.reduce((acc: Partial<MQMSTask>, key) => {
        if (obj[key] !== null && obj[key] !== undefined) {
          acc[key] = obj[key] as MQMSTask[typeof key];
        }
        return acc;
      }, {} as Partial<MQMSTask>) as MQMSTask
  );
}

export function getCustomField(fieldName: string): CustomField {
  const foundField =
    CLICKUP_HS_CUSTOM_FIELDS.fields.find(field => field.name === fieldName) ||
    CLICKUP_BAU_CUSTOM_FIELDS.fields.find(field => field.name === fieldName);

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
          assignee: taskField['PREASBUILT QC BY'][0] || 0,
        };

      case 'design in qc by irazu':
        return {
          ...payload,
          assignee: taskField['DESIGN QC BY'][0] || 0,
        };

      case 'redesign in qc by irazu':
        return {
          ...payload,
          assignee: taskField['REDESIGN QC BY'][0] || 0,
        };

      case 'ready for qc':
        return {
          ...payload,
          assignee: taskField['QC PERFORMED BY'][0] || 0,
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
  return tasks.map(task => {
    let designers: string = '';

    task?.assignees?.forEach(assignee => {
      designers += assignee.username + ', ';
    });
    const receivedDate = task?.custom_fields?.find(field => field.name === 'RECEIVED DATE')
      ?.value as string;
    const completionDate = task?.custom_fields?.find(
      field => field.name === 'ACTUAL COMPLETION DATE'
    )?.value as string;
    const codes = task?.custom_fields?.filter(
      field =>
        field.type === 'number' &&
        field.value &&
        (field.name?.includes('(EA)') ||
          field.name?.includes('(FT)') ||
          field.name?.includes('(HR)'))
    ) as CustomField[];

    return {
      designers,
      id: task.id as string,
      name: task.name,
      receivedDate: new Date(Number(receivedDate)).toLocaleDateString(),
      completionDate: new Date(Number(completionDate)).toLocaleDateString(),
      codes,
    };
  });
}

export function formatApprovedHsTasks(tasks: Task[]): ApprovedBauTasks[] {
  return tasks.map(task => {
    let designers: string = '';

    if (task?.assignees && task?.assignees.length > 0) {
      task?.assignees?.forEach(assignee => {
        designers += assignee.username + ', ';
      });
    } else {
      const designAssignee = task?.custom_fields?.find(field => field.name === 'DESIGN ASSIGNEE')
        ?.value as User[];

      if (designAssignee) {
        designAssignee.forEach(assignee => {
          designers += assignee.username + ', ';
        });
      }
    }

    const receivedDate = task?.custom_fields?.find(field => field.name === 'RECEIVED DATE')
      ?.value as string;

    const isDesign = task?.custom_fields?.find(field => field.name === 'PROJECT TYPE')?.value === 0;

    const completionDate = isDesign
      ? (task?.custom_fields?.find(field => field.name === 'ACTUAL COMPLETION DATE')
          ?.value as string)
      : (task?.custom_fields?.find(field => field.name === 'REDESIGN ACTUAL COMPLETION DATE')
          ?.value as string);

    const codeNames = ['ASBUILT ROUNDED MILES', 'DESIGN ROUNDED MILES', 'REDESIGN TIME'];

    const codes = task?.custom_fields?.filter(
      field => codeNames.includes(field.name as string) && field.value && field.type === 'number'
    ) as CustomField[];

    return {
      designers,
      id: task.id as string,
      name: task.name,
      receivedDate: new Date(Number(receivedDate)).toLocaleDateString(),
      completionDate: new Date(Number(completionDate)).toLocaleDateString(),
      codes,
    };
  });
}

export function formatBauIncomeDataForExcel<T extends Record<string, number>>(
  tasks: ApprovedBauTasks[],
  prices: T
): BauIncomeData[] {
  return tasks.reduce<BauIncomeData[]>((acc, task) => {
    task.codes?.forEach(code => {
      const price = prices[code.name as keyof T] || 0;
      const quantity = Number(code.value);
      acc.push({
        id: task.id,
        name: task.name,
        designers: task.designers,
        receivedDate: task.receivedDate ? new Date(task.receivedDate) : null,
        completionDate: task.completionDate ? new Date(task.completionDate) : null,
        code: code.name || '',
        quantity: code.value as string,
        price,
        total: quantity * price,
      });
    });
    return acc;
  }, []);
}
