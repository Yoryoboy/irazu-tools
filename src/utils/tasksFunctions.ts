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
