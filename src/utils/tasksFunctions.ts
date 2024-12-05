import {
  CustomFieldName,
  MQMSTask,
  Task,
  PostNewTaskResult,
  FulfilledPostNewTaskResult,
  RejectedPostNewTaskResult,
} from "../types.d";

import {
  formatString,
  getNewDropdownCustomFieldObject,
  getTextCustomFieldObject,
} from "./helperFunctions";

import { CLICKUP_LIST_IDS } from "../constants/clickUpCustomFields";

const apikey = import.meta.env.VITE_CLICKUP_API_AKEY;

export function getNewTasksFromMqms(
  MQMSTasks: MQMSTask[],
  clickUpTasks: Task[]
): MQMSTask[] {
  const clickUpTaskMap = new Map<string, string>();

  clickUpTasks.forEach((task) => {
    const secondaryIdField = task.custom_fields?.find(
      (field) => field.name === CustomFieldName.SecondaryID
    );
    const secondaryId = secondaryIdField?.value as string | undefined;

    if (secondaryId) {
      clickUpTaskMap.set(task.name, secondaryId);
    }
  });

  const newMqmsTasks = MQMSTasks.filter((task) => {
    const existsInClickUp =
      clickUpTaskMap.has(task.EXTERNAL_ID) &&
      clickUpTaskMap.get(task.EXTERNAL_ID) === task.SECONDARY_EXTERNAL_ID;
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
  const [plantTypeUnformatted, projectType, nodeSegSplit] =
    row.PROJECT_TYPE.split(" - ");
  const plantType = formatString(plantTypeUnformatted);

  console.log("Plant Type:", plantType);
  console.log("Project Type:", projectType);
  console.log("Node:", nodeSegSplit);

  const plantTypeCustomFieldValue = getNewDropdownCustomFieldObject(
    "PLANT TYPE",
    plantType
  );

  const projectTypeCustomFieldValue = getNewDropdownCustomFieldObject(
    "PROJECT TYPE",
    projectType
  );

  const secondaryIdCustomFieldValue = getTextCustomFieldObject(
    "SECONDARY ID",
    row.SECONDARY_EXTERNAL_ID
  );

  const customFields = [
    plantTypeCustomFieldValue,
    projectTypeCustomFieldValue,
    secondaryIdCustomFieldValue,
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
  setMQMSTasks: (tasks: MQMSTask[]) => void
) => {
  const newTask: Task[] = [getNewTask(row)];
  const results = await postNewTasks(newTask, CLICKUP_LIST_IDS.cciBau, apikey);

  const successfulTasks = results.filter(
    (result): result is FulfilledPostNewTaskResult =>
      result.status === "fulfilled"
  );

  if (successfulTasks.length > 0) {
    console.log("Tareas procesadas:", successfulTasks);
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
  setMQMSTasks: (tasks: MQMSTask[]) => void
) => {
  const allNewTasks = newMqmsTasks.map((row) => getNewTask(row));
  const results = await postNewTasks(
    allNewTasks,
    CLICKUP_LIST_IDS.cciBau,
    apikey
  );

  const successfulTasks = results.filter(
    (result): result is FulfilledPostNewTaskResult =>
      result.status === "fulfilled"
  );

  if (successfulTasks.length > 0) {
    console.log("Tareas procesadas:", successfulTasks);
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
