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

async function postNewTasks(
  newTasks: Task[],
  listId: string,
  apikey: string
): Promise<void> {
  for (const task of newTasks) {
    const resp = await fetch(
      `https://api.clickup.com/api/v2/list/${listId}/task?`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apikey,
        },
        body: JSON.stringify(task),
      }
    );

    if (!resp.ok) {
      throw new Error(`Error creating task ${task.name}: ${resp.statusText}`);
    }

    const data = await resp.json();
    console.log(data);
  }
}

function NewTasksTable({ newMqmsTasks }: Props) {
  const handleAction = async (row: MQMSTask) => {
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

    const newTask = [
      {
        name: row.EXTERNAL_ID,
        description: row.JOB_NAME,
        custom_fields: customFields,
      },
    ];

    await postNewTasks(newTask, CLICKUP_LIST_IDS.cciBau, apikey);
    console.log("Task created");
  };

  return (
    <div>
      <TasksTable
        data={newMqmsTasks}
        renderAdditionalColumns={(row) => (
          <button onClick={() => handleAction(row)}>Action</button>
        )}
      />
    </div>
  );
}

export default NewTasksTable;
