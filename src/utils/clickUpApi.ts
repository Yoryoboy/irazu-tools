import axios from "axios";
import {
  CreateNewTimeEntryData,
  CreateNewTimeEntryResponse,
  Task,
  TimetrackingPayload,
  TimetrackingVerificationPayload,
  newTimeEntryPayload,
} from "../types/Task";
import { CLICKUP_API_AKEY, TEAM_ID } from "./config";
import { Result } from "../types/AsyncResult";

const clickUp = axios.create({
  baseURL: "https://api.clickup.com/api/v2",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

clickUp.interceptors.request.use(
  (config) => {
    config.headers.Authorization = CLICKUP_API_AKEY;
    return config;
  },
  (error) => Promise.reject(error)
);

export async function getTask(taskId: string): Promise<Result<Task>> {
  try {
    const response = await clickUp.get(`/task/${taskId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error al obtener respuesta de la tarea ${taskId}:`, error);

    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: { status: 500, message: "Unknown error" },
    };
  }
}

export async function updateCustomFieldLabel(
  taskId: string,
  fieldId: string,
  value: boolean
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

/**
 * Updates the timetracked field for a task in ClickUp
 */
export async function updateTimetracked(
  payload: TimetrackingVerificationPayload
): Promise<CreateNewTimeEntryResponse> {
  try {
    const customFieldId = "e4ae3c81-f4cd-4e07-a8c1-0e50490e6bdb";
    const URL = `https://api.clickup.com/api/v2/task/${payload.clickUpID}/field/${customFieldId}`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: CLICKUP_API_AKEY,
      },
      body: JSON.stringify({
        value: true
      }),
    };

    const response = await fetch(URL, options);
    let responseData;
    
    try {
      responseData = await response.json();
    } catch {
      responseData = {};
    }

    if (!response.ok) {
      console.error(`Error updating timetracked field for task ${payload.clickUpID}:`, responseData);
      return { 
        status: "error", 
        message: `Error updating timetracked field for task ${payload.clickUpID}`,
        data: { data: responseData }
      };
    }

    console.log(`Timetracked field updated successfully for task ${payload.clickUpID}`);

    return {
      status: "success",
      message: `Timetracked field updated successfully for task ${payload.clickUpID}`,
      data: { data: responseData }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in updateTimetracked:`, error);
    return { 
      status: "error", 
      message: errorMessage,
    };
  }
}

/**
 * Creates a new time entry for a task in ClickUp
 */
export async function createNewTimeEntry(
  payload: newTimeEntryPayload
): Promise<CreateNewTimeEntryResponse> {
  try {
    const URL = `https://api.clickup.com/api/v2/team/${TEAM_ID}/time_entries`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: CLICKUP_API_AKEY,
      },
      body: JSON.stringify({
        tid: payload.clickUpID,
        assignee: payload.assignee,
        start: payload.start,
        stop: payload.stop,
        duration: payload.duration,
        tags: payload.tags,
      }),
    };

    const response = await fetch(URL, options);
    let responseData;
    
    try {
      responseData = await response.json();
    } catch {
      responseData = {};
    }

    if (!response.ok) {
      console.error(`Error creating new time entry:`, responseData);
      return { 
        status: "error", 
        message: `Error creating new time entry:`,
        data: { data: responseData }
      };
    }

    console.log(
      `New time entry created successfully for task ${payload.clickUpID}`
    );

    return {
      status: "success",
      message: `New time entry created successfully for task ${payload.clickUpID}`,
      data: responseData as CreateNewTimeEntryData
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in createNewTimeEntry:`, error);
    return { 
      status: "error", 
      message: errorMessage,
    };
  }
}

/**
 * Handles time entry creation or timetracked field update based on payload type
 */
export async function createNewtimeEntry(
  payload: TimetrackingPayload
): Promise<CreateNewTimeEntryResponse> {
  console.log("createNewtimeEntry", payload);
  
  if ('timetracked' in payload) {
    return updateTimetracked(payload);
  } else {
    return createNewTimeEntry(payload);
  }
}
