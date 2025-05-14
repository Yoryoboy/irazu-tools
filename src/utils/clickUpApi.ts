import axios from "axios";
import {
  CreateNewTimeEntryData,
  CreateNewTimeEntryResponse,
  newTimeEntryPayload,
  Task,
  PostNewTaskResponse,
} from "../types/Task";
import { CLICKUP_API_AKEY, TEAM_ID } from "./config";
import { Result } from "../types/AsyncResult";
import { SearchParams } from "../types/SearchParams";

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


export async function getTasks(listId: string, searchParams: SearchParams): Promise<Result<Task[]>> {
  try {
    let allTasks: Task[] = [];
    let page = 0;
    let lastPage = false;
    
    do {
      
      const query = new URLSearchParams();
      
      query.append('page', page.toString());
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (key !== 'page') {
          if (Array.isArray(value)) {
            value.forEach(item => query.append(key, item));
          } else {
            query.append(key, value.toString());
          }
        }
      });
      
      const response = await clickUp.get(`/list/${listId}/task?${query.toString()}`);
      
      allTasks = [...allTasks, ...response.data.tasks];
      
      lastPage = response.data.last_page;
      
      page += 1;
      
    } while (!lastPage);
    
    return { 
      success: true, 
      data: allTasks 
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
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

export async function createTask(task: Task, listId: string): Promise<Result<PostNewTaskResponse>> {
  try {
    const response = await clickUp.post(`/list/${listId}/task`, task);
    
    return { 
      success: true, 
      data: {
        taskName: task.name,
        status: 'success',
        clickUpTaskId: response.data.id,
      }
    };
  } catch (error) {
    console.error(`Error creating task ${task.name}:`, error);
    
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

export async function createNewtimeEntry(
  payload: newTimeEntryPayload
): Promise<CreateNewTimeEntryResponse> {
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

  try {
    const response = await fetch(URL, options);
    const responseData: CreateNewTimeEntryData = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error creating new time entry:`, errorData);
      return { status: "error", message: `Error creating new time entry:` };
    }

    console.log(
      `New time entry created successfully for task ${payload.clickUpID}`
    );

    return {
      status: "success",
      message: `New time entry created successfully for task ${payload.clickUpID}`,
      data: responseData,
    };
  } catch (error) {
    console.error(`Error creating new time entry:`, error);
    return { status: "error", message: `Error creating new time entry:` };
  }
}
