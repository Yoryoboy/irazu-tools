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
