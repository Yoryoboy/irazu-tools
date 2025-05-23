import { CLICKUP_BAU_CUSTOM_FIELDS } from "../constants/clickUpCustomFields";
import { members } from "../constants/members";
import { TaskTimeDataWithClickUpID } from "../types/MQMS";
import {
  CheckedSubcoBillingStatusPayloads,
  CustomField,
  ExtractedTaskFieldValues,
  NewCustomFieldObject,
  newTimeEntryPayload,
  Option,
  Status,
  Task,
  TaskRow,
  User,
} from "../types/Task";
import { getCustomField } from "./tasksFunctions";

export function formatString(input: string) {
  const regex = /(\w+)\/\s+(\w+)/; // Patrón: string/[espacio]string
  if (regex.test(input)) {
    return input.replace(regex, "$1 / $2"); // Reemplazo con espacios alrededor de "/"
  }
  return input; // Si no coincide, retorna el string original
}

export function getCustomFieldDetails(fieldName: string): CustomField {
  const customFieldDetails = CLICKUP_BAU_CUSTOM_FIELDS.fields.find(
    (field) => field.name === fieldName
  );

  if (!customFieldDetails) {
    throw new Error(`Custom field ${fieldName} not found`);
  }
  return customFieldDetails;
}

export function getDropdownCustomFieldOption(
  customFieldDetails: CustomField,
  optionName: string
): Option {
  const options = customFieldDetails.type_config?.options || [];

  const customFieldOption =
    options.find((option) => option.name === optionName) ||
    options.find((option) => option.name === "UNKNOWN");

  if (!customFieldOption) {
    throw new Error(`Custom field options not found`);
  }

  return customFieldOption;
}

export function getNewDropdownCustomFieldObject(
  fieldName: string,
  optionName: string,
  defaultValue: string
): NewCustomFieldObject {
  const customFieldDetails = getCustomFieldDetails(fieldName);

  if (!customFieldDetails.id) {
    throw new Error(`Custom field ID is missing for field: ${fieldName}`);
  }

  const customFieldOption = getDropdownCustomFieldOption(
    customFieldDetails,
    optionName
  );

  if (!customFieldOption.id) {
    return {
      id: customFieldDetails.id,
      value: defaultValue,
    };
  }

  return {
    id: customFieldDetails.id,
    value: customFieldOption.id,
  };
}

export function getTextCustomFieldObject(
  fieldName: string,
  value: string
): NewCustomFieldObject {
  const fieldDetails = getCustomFieldDetails(fieldName);

  if (!fieldDetails.id) {
    throw new Error(`Field ID is missing for field: ${fieldName}`);
  }
  return {
    id: fieldDetails.id,
    value: value,
  };
}

export function extractTaskFields(
  task: Task,
  fields: (keyof ExtractedTaskFieldValues)[]
): ExtractedTaskFieldValues {
  const result: Partial<ExtractedTaskFieldValues> = {};

  fields.forEach((field) => {
    // Si el campo existe directamente en el objeto task
    if (field in task) {
      const value = task[field as keyof Task];
      if (typeof value === "string" && !Array.isArray(value)) {
        result[field] = value.toString();
      } else if (Array.isArray(value)) {
        result[field] = task.assignees
          ? value?.map((user) => user?.username)
          : "";
      } else if (field === "status" && typeof value === "object") {
        result[field] = (value as Status).status;
      }
    } else {
      // Buscar en custom_fields si es un campo personalizado
      const customField = task.custom_fields?.find((cf) => cf.name === field);
      if (customField) {
        if (
          customField.type === "drop_down" &&
          customField.type_config?.options
        ) {
          // Si el campo es de tipo drop_down, buscar el nombre de la opción correspondiente
          const selectedOption = customField.type_config.options.find(
            (option) => option.orderindex === customField.value
          );
          result[field] =
            selectedOption != null ? selectedOption.name?.toString() : ""; // Asignar el nombre de la opción o null
        } else if (
          customField.type === "labels" &&
          customField.type_config?.options
        ) {
          // Si el campo es de tipo labels, mapear los IDs a sus etiquetas correspondientes
          result[field] =
            customField.value && Array.isArray(customField.value)
              ? customField.value
                  // Filtrar para asegurarte de que son cadenas
                  .map(
                    (id) =>
                      customField.type_config?.options?.find(
                        (option) => option.id === id
                      )?.label || ""
                  )
                  .filter((label) => label !== "")
              : [];
          // Filtrar valores nulos
        } else if (customField.type === "date") {
          result[field] =
            new Date(Number(customField.value)).toLocaleDateString() || "";
        } else if (customField.type === "users") {
          result[field] =
            customField.value && Array.isArray(customField.value)
              ? customField.value.map((user) => user?.id)
              : "";
        } else {
          // Para otros tipos de campos personalizados, usar el valor directamente
          result[field] = (customField.value as string) ?? "";
        }
      }
    }
  });

  return result;
}

export function unifyProjects(
  asbuiltArray: ExtractedTaskFieldValues[],
  designArray: ExtractedTaskFieldValues[],
  redesignArray: ExtractedTaskFieldValues[]
): ExtractedTaskFieldValues[] {
  const unifiedArray: ExtractedTaskFieldValues[] = [];

  // Procesar ASBUILT
  asbuiltArray.forEach((item) => {
    unifiedArray.push({
      id: item.id,
      name: item.name,
      receivedDate: item["RECEIVED DATE"],
      completionDate: item["PREASBUILT ACTUAL COMPLETION DATE "] || "",
      quantity: item["ASBUILT ROUNDED MILES"] || "0",
      checkedForSubco: item["CHECKED FOR SUBCO"] || [],
      projectCode: item.projectCode,
    });
  });

  // Procesar DESIGN
  designArray.forEach((item) => {
    unifiedArray.push({
      id: item.id,
      name: item.name,
      receivedDate: item["RECEIVED DATE"],
      completionDate: item["ACTUAL COMPLETION DATE"] || "",
      quantity: item["DESIGN ROUNDED MILES"] || "0",
      checkedForSubco: item["CHECKED FOR SUBCO"] || [],
      projectCode: item.projectCode,
    });
  });

  // Procesar REDESIGN
  redesignArray.forEach((item) => {
    unifiedArray.push({
      id: item.id,
      name: item.name,
      receivedDate: item["RECEIVED DATE"],
      completionDate: item["REDESIGN ACTUAL COMPLETION DATE"] || "",
      quantity: item["TIME SPENT BY VENDOR"] || item["REDESIGN TIME"] || "0",
      checkedForSubco: item["CHECKED FOR SUBCO"] || [],
      projectCode: item.projectCode,
    });
  });

  return unifiedArray;
}

export function getUser(userId: number): User {
  return members.find((member) => member.user?.id === userId)?.user || {};
}

export function splitTaskArray(array: string[], chunkSize: number): string[][] {
  const result: string[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

export function getTimetrackingPayloadForTask(
  tasksList: TaskTimeDataWithClickUpID
): newTimeEntryPayload[] {
  const { clickUpID, assignee, data } = tasksList;
  const payload = data.map((time) => {
    return {
      clickUpID,
      assignee,
      start: new Date(time.start).getTime(),
      stop: new Date(time.stop).getTime(),
      tags: [{ name: "mqms time", tag_bg: "#6E56CF", tag_fg: "#6E56CF" }],
    };
  });
  return payload.filter((payload) => payload.start < payload.stop);
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function sendBatchedRequests<T, R>(
  payloads: T[],
  batchSize: number,
  postRequestCallback: (payload: T) => Promise<R>
): Promise<R[]> {

  const batches = chunkArray(payloads, batchSize);
  const results: R[] = [];

  for (let i = 0; i < batches.length; i++) {
    console.log(`Sending batch ${i + 1} of ${batches.length}...`);

    const batchResults = await Promise.all(
      batches[i].map((payload) => postRequestCallback(payload))
    );

    results.push(...batchResults);

    console.log(`Batch ${i + 1} sent successfully.`);

    if (i < batches.length - 1) {
      console.log("Waiting 60 seconds before sending the next batch...");
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }

  console.log("All batches sent successfully!");
  return results;
}

export function getCheckedSubcoBillingStatusPayloads(
  tasks: ExtractedTaskFieldValues[] | TaskRow[]
): CheckedSubcoBillingStatusPayloads[] {
  const asbuiltChecked = getCustomField("ASBUILT CHECKED");
  const designChecked = getCustomField("DESIGN CHECKED");
  const redesignChecked = getCustomField("REDESIGN CHECKED");
  const bauChecked = getCustomField("BAU CHECKED");

  return tasks.map((task) => {
    let customFieldId: string;
    let code = task.projectCode as string;

    if (code.includes("CCI - BAU")) {
      code = "CCI - BAU";
    }

    switch (code) {
      case "CCI - HS ASBUILT":
        customFieldId = asbuiltChecked.id ?? "";
        break;
      case "CCI - HS DESIGN":
        customFieldId = designChecked.id ?? "";
        break;
      case "CCI - REDESIGN":
        customFieldId = redesignChecked.id ?? "";
        break;
      case "CCI - BAU":
        customFieldId = bauChecked.id ?? "";
        break;
      default:
        customFieldId = "";
    }
    return {
      taskId: task.id,
      customFieldId,
      value: true,
    } as CheckedSubcoBillingStatusPayloads;
  });
}
