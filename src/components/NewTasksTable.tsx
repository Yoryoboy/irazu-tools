import TasksTable from "./TasksTable";
import {
  Field,
  MQMSTask,
  Option,
  NewCustomFieldObject,
  Task,
} from "../types.d";
import {
  CLICKUP_CUSTOM_FIELDS,
  CLICKUP_LIST_IDS,
} from "../constants/clickUpCustomFields";

const apikey = import.meta.env.VITE_CLICKUP_API_AKEY;

interface Props {
  newMqmsTasks: MQMSTask[];
  setMQMSTasks: (tasks: MQMSTask[]) => void;
}

export interface FulfilledPostNewTaskResult {
  status: "fulfilled";
  value: {
    taskName: string;
    status: "success";
    clickUpTaskId: string;
  };
}

export interface RejectedPostNewTaskResult {
  status: "rejected";
  reason: string;
}

export type PostNewTaskResult =
  | FulfilledPostNewTaskResult
  | RejectedPostNewTaskResult;

function formatString(input: string) {
  const regex = /(\w+)\/\s+(\w+)/; // Patrón: string/[espacio]string
  if (regex.test(input)) {
    return input.replace(regex, "$1 / $2"); // Reemplazo con espacios alrededor de "/"
  }
  return input; // Si no coincide, retorna el string original
}

function getCustomFieldDetails(fieldName: string): Field {
  const customFieldDetails = CLICKUP_CUSTOM_FIELDS.fields.find(
    (field) => field.name === fieldName
  );

  if (!customFieldDetails) {
    throw new Error(`Custom field ${fieldName} not found`);
  }
  return customFieldDetails;
}

function getDropdownCustomFieldOption(
  customFieldDetails: Field,
  optionName: string
): Option {
  const customFieldOptions = customFieldDetails.type_config?.options?.find(
    (option) => option.name === optionName
  );
  if (!customFieldOptions) {
    throw new Error(`Custom field options not found`);
  }
  return customFieldOptions;
}

function getNewDropdownCustomFieldObject(
  fieldName: string,
  optionName: string
): NewCustomFieldObject {
  const customFieldDetails = getCustomFieldDetails(fieldName);
  const customFieldOption = getDropdownCustomFieldOption(
    customFieldDetails,
    optionName
  );
  return {
    id: customFieldDetails.id,
    value: customFieldOption.id,
  };
}

function getTextCustomFieldObject(
  fieldName: string,
  value: string
): NewCustomFieldObject {
  return {
    id: getCustomFieldDetails(fieldName).id,
    value: value,
  };
}

async function postNewTasks(
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

function getNewTask(row: MQMSTask): Task {
  const [plantTypeUnformatted, projectType] = row.PROJECT_TYPE.split(" - ");
  const plantType = formatString(plantTypeUnformatted);

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

function updateNewMqmsTasks(newTaskName: string, newMqmsTasks: MQMSTask[]) {
  return newMqmsTasks.filter((task) => task.EXTERNAL_ID !== newTaskName);
}

function NewTasksTable({ newMqmsTasks, setMQMSTasks }: Props) {
  const handleAction = async (row: MQMSTask) => {
    const newTask: Task[] = [];
    newTask.push(getNewTask(row));
    const results = await postNewTasks(
      newTask,
      CLICKUP_LIST_IDS.cciBau,
      apikey
    );

    const failedTasks = results.filter(
      (result) => result.status === "rejected"
    );
    if (failedTasks.length > 0) {
      console.error("Error procesando tareas:", failedTasks);
    }

    const successfulTasks = results.filter(
      (result) => result.status === "fulfilled"
    );
    if (successfulTasks.length > 0) {
      console.log("Tareas procesadas:", successfulTasks);
      setMQMSTasks(
        updateNewMqmsTasks(successfulTasks[0].value.taskName, newMqmsTasks)
      );
    }
  };

  const handleSyncAll = async () => {
    const allNewTasks = newMqmsTasks.map((row) => getNewTask(row));

    const results = await postNewTasks(
      allNewTasks,
      CLICKUP_LIST_IDS.cciBau,
      apikey
    );

    const failedTasks = results.filter(
      (result) => result.status === "rejected"
    );
    if (failedTasks.length > 0) {
      console.error("Error procesando tareas:", failedTasks);
    }

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
  };

  return (
    <div>
      <TasksTable
        data={newMqmsTasks}
        renderAdditionalColumns={(row) => (
          <button onClick={() => handleAction(row)}>Action</button>
        )}
      />
      <button onClick={handleSyncAll}>Sincronizar todas las tareas</button>
    </div>
  );
}

export default NewTasksTable;
