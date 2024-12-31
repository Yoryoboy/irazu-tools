import {
  CustomField,
  ExtractedTaskFieldValues,
  TaskLabelPayload,
} from "../types/Task";
import { CLICKUP_API_AKEY } from "./config";

export async function updateCustomFieldLabel(
  taskId: string,
  fieldId: string,
  value: string[]
): Promise<{ success: boolean; error?: string }> {
  const url = `https://api.clickup.com/api/v2/task/${taskId}/field/${fieldId}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: CLICKUP_API_AKEY,
      },
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error updating field for task ${taskId}:`, errorData);
      return { success: false, error: errorData.message || "Unknown error" };
    }

    return { success: true };
  } catch (error) {
    console.error(`Error updating field for task ${taskId}:`, error);

    if (error instanceof Error) {
      return { success: false, error: error.message || "Unknown error" };
    }

    return { success: false, error: "Unknown error" };
  }
}

export function getTaskLabelPayload(
  task: ExtractedTaskFieldValues,
  customField: CustomField
): TaskLabelPayload {
  const { id: taskId, projectCode } = task;

  if (typeof taskId != "string") {
    throw new Error("Task ID is not a string");
  }

  if (typeof projectCode != "string") {
    return { taskId, error: "Project Code is not a string" };
  }

  // Determinar el valor basado en projectCode
  const value = getValueForProjectCode(task, projectCode, customField);

  if (!value || value.length === 0) {
    console.error(`No valid label found for task ${taskId}`);
    return {
      taskId,
      error: `No valid label found for task ${taskId}`,
    };
  }

  if (typeof customField.id != "string") {
    return { taskId, error: "Custom Field ID is not a string" };
  }

  return {
    taskId,
    customFieldId: customField.id,
    value,
  };
}

function getValueForProjectCode(
  task: ExtractedTaskFieldValues,
  projectCode: string,
  customField: CustomField
): string[] {
  const asbuiltCheckedId = customField?.type_config?.options?.find(
    (o) => o.label === "ASBUILT CHECKED"
  )?.id;

  const designCheckedId = customField?.type_config?.options?.find(
    (o) => o.label === "DESIGN CHECKED"
  )?.id;

  if (
    projectCode === "CCI - HS DESIGN" &&
    Array.isArray(task.checkedForSubco) &&
    task.checkedForSubco?.includes("ASBUILT CHECKED")
  ) {
    return [asbuiltCheckedId, designCheckedId].filter(Boolean) as string[];
  } else if (projectCode === "CCI - HS ASBUILT") {
    return [asbuiltCheckedId].filter(Boolean) as string[];
  } else {
    return [designCheckedId].filter(Boolean) as string[];
  }
}
