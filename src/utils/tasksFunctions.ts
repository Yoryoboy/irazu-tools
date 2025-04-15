import {
  BulkTasksTimeStatus,
  CustomField,
  ExtractedTaskFieldValues,
  FulfilledPostNewTaskResult,
  MQMSTask,
  newTimeEntryPayload,
  PostNewTaskResult,
  RejectedPostNewTaskResult,
  Task,
} from "../types/Task";

import {
  formatString,
  getNewDropdownCustomFieldObject,
  getTextCustomFieldObject,
} from "./helperFunctions";

import {
  CLICKUP_BAU_CUSTOM_FIELDS,
  CLICKUP_HS_CUSTOM_FIELDS,
} from "../constants/clickUpCustomFields";
import { SearchParams } from "../types/SearchParams";
import { TaskTimeData, TaskTimeDataWithClickUpID } from "../types/MQMS";

const apikey = import.meta.env.VITE_CLICKUP_API_AKEY;

export function getNewTasksFromMqms(
  MQMSTasks: MQMSTask[],
  clickUpTasks: Task[]
): MQMSTask[] {
  const clickUpTasksUUID = clickUpTasks.map((task) => {
    return task.custom_fields?.find((field) => field.name === "WORK REQUEST ID")
      ?.value;
  });

  const newMqmsTasks = MQMSTasks.filter((task) => {
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
    newTasks.map((task) =>
      fetch(`https://api.clickup.com/api/v2/list/${listId}/task?`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apikey,
        },
        body: JSON.stringify(task),
      })
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(
              `Error creating task ${task.name}: ${resp.statusText}`
            );
          }
          return resp.json();
        })
        .then((data) => ({
          taskName: task.name,
          status: "success",
          clickUpTaskId: data.id,
        }))
    )
  );

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return {
        status: "fulfilled",
        value: result.value,
      } as FulfilledPostNewTaskResult;
    } else {
      return {
        status: "rejected",
        reason: result.reason,
      } as RejectedPostNewTaskResult;
    }
  });
}

export function getNewTask(row: MQMSTask): Task {
  const [plantTypeUnformatted, projectType, jobType] =
    row.PROJECT_TYPE.split(" - ");
  const plantType = formatString(plantTypeUnformatted);

  const plantTypeCustomFieldValue = getNewDropdownCustomFieldObject(
    "PLANT TYPE",
    plantType,
    "77b959a3-d6ee-4c4e-8d21-575559a9080a"
  );

  const projectTypeCustomFieldValue = getNewDropdownCustomFieldObject(
    "PROJECT TYPE",
    projectType,
    "ff865e6f-323f-49a0-bad5-9c9b439c8d64"
  );

  const jobTypeCustomFieldValue = getNewDropdownCustomFieldObject(
    "JOB TYPE CCI",
    jobType,
    "81f785fe-7a17-4075-ad7b-29918a6f55ad"
  );

  const secondaryIdCustomFieldValue = getTextCustomFieldObject(
    "SECONDARY ID",
    row.SECONDARY_EXTERNAL_ID
  );

  const nodeNameCustomFieldValue = getTextCustomFieldObject(
    "NODE",
    row.NODE_NAME
  );

  const workRequestCustomFieldValue = getTextCustomFieldObject(
    "WORK REQUEST ID",
    row.REQUEST_ID
  );

  const hubCustomFieldValue = getTextCustomFieldObject("HUB", row.HUB);

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
    custom_fields: customFields,
  };
}

export const updateNewMqmsTasks = (
  newTaskName: string,
  newMqmsTasks: MQMSTask[]
) => newMqmsTasks.filter((task) => task.EXTERNAL_ID !== newTaskName);

export const handleAction = async (
  row: MQMSTask,
  newMqmsTasks: MQMSTask[],
  setMQMSTasks: (tasks: MQMSTask[]) => void,
  listId: string
) => {
  const newTask: Task[] = [getNewTask(row)];
  console.log(newTask);
  const results = await postNewTasks(newTask, listId, apikey);

  const successfulTasks = results.filter(
    (result): result is FulfilledPostNewTaskResult =>
      result.status === "fulfilled"
  );

  if (successfulTasks.length > 0) {
    setMQMSTasks(
      updateNewMqmsTasks(successfulTasks[0].value.taskName, newMqmsTasks)
    );
  }

  const failedTasks = results.filter((result) => result.status === "rejected");
  if (failedTasks.length > 0) {
    console.error("Error procesando tareas:", failedTasks);
  }
};

export const handleSyncAll = async (
  newMqmsTasks: MQMSTask[],
  setMQMSTasks: (tasks: MQMSTask[]) => void,
  listId: string
) => {
  const allNewTasks = newMqmsTasks.map((row) => getNewTask(row));
  const results = await postNewTasks(allNewTasks, listId, apikey);

  const successfulTasks = results.filter(
    (result): result is FulfilledPostNewTaskResult =>
      result.status === "fulfilled"
  );

  if (successfulTasks.length > 0) {
    const updatedTasks = newMqmsTasks.filter(
      (task) =>
        !successfulTasks.some(
          (success) => success.value.taskName === task.EXTERNAL_ID
        )
    );
    setMQMSTasks(updatedTasks);
  }

  const failedTasks = results.filter((result) => result.status === "rejected");
  if (failedTasks.length > 0) {
    console.error("Error procesando tareas:", failedTasks);
  }
};

export async function fetchFilteredTasks(
  teamId: string,
  searchParams: SearchParams,
  apiKey: string
): Promise<Task[]> {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
  });
  const query = params.toString();

  try {
    const response = await fetch(
      `https://api.clickup.com/api/v2/team/${teamId}/task?${query}`,
      {
        method: "GET",
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
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

export function getCustomField(fieldName: string): CustomField {
  const foundField =
    CLICKUP_HS_CUSTOM_FIELDS.fields.find((field) => field.name === fieldName) ||
    CLICKUP_BAU_CUSTOM_FIELDS.fields.find((field) => field.name === fieldName);

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
    .map((task) => {
      const clickUpID = task.task_id;
      const partialPayload = task.status_history
        .flat()
        .filter((status) => validStatuses.includes(status.status))
        .map((time) => {
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

  const payloadWithQcer = addQcerToTaskByStatus(
    payloads,
    extractedTaskFieldValues
  );

  const QcPayloads = payloadWithQcer.map((payload) => {
    return {
      ...payload,
      tags: [
        {
          name: "qc time",
          tag_bg: "#e93d82",
          tag_fg: "#e93d82",
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
  const payloadWithQcer: Partial<newTimeEntryPayload>[] = payloads.map(
    (payload) => {
      const taskField = extractedTaskFieldValues.find(
        (t) => t.id === payload.clickUpID
      ) as ExtractedTaskFieldValues;

      switch (payload.status) {
        case "asbuilt in qc by irazu":
          return {
            ...payload,
            assignee: (taskField["PREASBUILT QC BY"] as number[])[0] || 0,
          };

        case "design in qc by irazu":
          return {
            ...payload,
            assignee: (taskField["DESIGN QC BY"] as number[])[0] || 0,
          };

        case "redesign in qc by irazu":
          return {
            ...payload,
            assignee: (taskField["REDESIGN QC BY"] as number[])[0] || 0,
          };

        case "internal qc":
          return {
            ...payload,
            assignee: (taskField["QC PERFORMED BY"] as number[])[0] || 0,
          };

        default:
          return payload;
      }
    }
  );

  return payloadWithQcer;
}

export function checkMissingWorkRequestID(tasks: Task[]): boolean {
  return tasks.length > 0
    ? tasks.some((task) => {
        const workRequestID = task?.custom_fields?.find(
          (field) => field.name === "WORK REQUEST ID"
        );

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
  return MQMSTasksTimetracker.map((task) => {
    const sentTask = tasks.find(
      (sentTask) => sentTask["WORK REQUEST ID"] === task.taskUuid
    );
    return { ...task, clickUpID: sentTask?.id?.toString() as string };
  }).map((task) => {
    const sentTask = filteredTasks.find(
      (sentTask) => sentTask.id === task.clickUpID
    );
    return { ...task, assignee: sentTask?.assignees?.[0]?.id as number };
  });
}
