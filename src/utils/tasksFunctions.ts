import { CustomFieldName, MQMSTask, Task } from "../types.d";

export function getNewTasksFromMqms(
  MQMSTasks: MQMSTask[],
  clickUpTasks: Task[]
): MQMSTask[] {
  const clickUpTaskMap = new Map<string, string>();

  clickUpTasks.forEach((task) => {
    const secondaryIdField = task.custom_fields.find(
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
