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
}

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

function postNewTasks(newTasks: Task[], listId: string, apikey: string): void {
  Promise.allSettled(
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
        .then((data) => {
          console.log(`Task created: ${task.name}`, data);
        })
        .catch((error) => {
          console.error(`Failed to create task: ${task.name}`, error);
          throw error;
        })
    )
  )
    .then((results) => {
      console.log(results);
    })
    .catch((error) => {
      console.error("Error processing tasks:", error);
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

function NewTasksTable({ newMqmsTasks }: Props) {
  const handleAction = (row: MQMSTask) => {
    const newTask: Task[] = [];
    newTask.push(getNewTask(row));
    postNewTasks(newTask, CLICKUP_LIST_IDS.cciBau, apikey);
  };

  const handleSyncAll = () => {
    const allNewTasks = newMqmsTasks.map((row) => getNewTask(row));
    postNewTasks(allNewTasks, CLICKUP_LIST_IDS.cciBau, apikey);
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
