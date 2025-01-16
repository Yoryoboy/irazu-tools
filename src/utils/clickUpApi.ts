import { CustomField, ExtractedTaskFieldValues } from "../types/Task";
import { CLICKUP_API_AKEY } from "./config";

async function updateCustomFieldLabel(
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

export async function updateTaskLabelForCCIHighSplit(
  task: ExtractedTaskFieldValues,
  customField: CustomField
): Promise<{ status: "success" | "error"; message: string }> {
  const { id: taskId, projectCode } = task;

  // Determinar el valor basado en projectCode
  const value =
    projectCode === "CCI - HS ASBUILT"
      ? ([
          customField?.type_config?.options?.find(
            (o) => o.label === "ASBUILT CHECKED"
          )?.id,
        ].filter(Boolean) as string[])
      : projectCode === "CCI - HS DESIGN"
      ? ([
          customField?.type_config?.options?.find(
            (o) => o.label === "DESIGN CHECKED"
          )?.id,
        ].filter(Boolean) as string[])
      : [];

  if (typeof taskId != "string") {
    return { status: "error", message: "Task ID is not a string" };
  }

  if (!value || value.length === 0) {
    console.error(`No valid label found for task ${taskId}`);
    return {
      status: "error",
      message: `No valid label found for task ${taskId}`,
    };
  }

  if (typeof customField.id != "string") {
    return { status: "error", message: "Custom Field ID is not a string" };
  }

  // Llamar a la función general para realizar el fetch
  const result = await updateCustomFieldLabel(taskId, customField.id, value);

  if (!result.success) {
    console.error(`Error updating task ${taskId}:`, result.error);
    return { status: "error", message: `Error updating task ${taskId}:` };
  }

  return { status: "success", message: "Task label updated successfully" };
}

export async function changeTaskStatus(status: string, taskId: string) {
  const url = `https://api.clickup.com/api/v2/task/${taskId}`;

  const body = JSON.stringify({
    status: status,
  });

  const options = {
    method: "PUT",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: CLICKUP_API_AKEY,
    },
    body,
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error updating task ${taskId}:`, errorData);
      return { status: "error", message: `Error updating task ${taskId}:` };
    }

    return {
      status: "success",
      message: `Task ${taskId} status updated successfully`,
    };
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return { status: "error", message: `Error updating task ${taskId}:` };
  }
}
