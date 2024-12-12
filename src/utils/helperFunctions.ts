import { CLICKUP_BAU_CUSTOM_FIELDS } from "../constants/clickUpCustomFields";
import {
  Field,
  Option,
  NewCustomFieldObject,
  Task,
  TaskFieldValue,
} from "../types.d";

export function formatString(input: string) {
  const regex = /(\w+)\/\s+(\w+)/; // Patrón: string/[espacio]string
  if (regex.test(input)) {
    return input.replace(regex, "$1 / $2"); // Reemplazo con espacios alrededor de "/"
  }
  return input; // Si no coincide, retorna el string original
}

export function getCustomFieldDetails(fieldName: string): Field {
  const customFieldDetails = CLICKUP_BAU_CUSTOM_FIELDS.fields.find(
    (field) => field.name === fieldName
  );

  if (!customFieldDetails) {
    throw new Error(`Custom field ${fieldName} not found`);
  }
  return customFieldDetails;
}

export function getDropdownCustomFieldOption(
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

export function getNewDropdownCustomFieldObject(
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

export function getTextCustomFieldObject(
  fieldName: string,
  value: string
): NewCustomFieldObject {
  return {
    id: getCustomFieldDetails(fieldName).id,
    value: value,
  };
}

export function extractTaskFields(
  task: Task,
  fields: string[]
): Record<string, TaskFieldValue> {
  const result: Partial<Record<string, TaskFieldValue>> = {};

  fields.forEach((field) => {
    // Si el campo existe directamente en el objeto task
    if (field in task) {
      const value = task[field as keyof Task];
      if (isTaskFieldValue(value)) {
        result[field] = value;
      } else {
        result[field] = null;
        console.log(`Task field ${field} is not a valid value, null assigned`);
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
          result[field] = selectedOption ? selectedOption.name : null; // Asignar el nombre de la opción o null
        } else if (
          customField.type === "labels" &&
          customField.type_config?.options
        ) {
          // Si el campo es de tipo labels, mapear los IDs a sus etiquetas correspondientes
          result[field] =
            customField.value && Array.isArray(customField.value)
              ? (customField.value as unknown[])
                  // Filtrar para asegurarte de que son cadenas
                  .map(
                    (id) =>
                      customField.type_config?.options?.find(
                        (option) => option.id === id
                      )?.label || null
                  )
                  .filter((label) => label !== null)
              : null;
          // Filtrar valores nulos
        } else if (customField.type === "date") {
          result[field] =
            new Date(Number(customField.value)).toLocaleDateString() || null;
        } else {
          // Para otros tipos de campos personalizados, usar el valor directamente
          result[field] = customField.value || null;
        }
      }
    }
  });

  return result;
}

function isTaskFieldValue(value: unknown): value is TaskFieldValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    Array.isArray(value) ||
    value === null
  );
}
