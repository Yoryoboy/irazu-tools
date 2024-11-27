import { CLICKUP_BAU_CUSTOM_FIELDS } from "../constants/clickUpCustomFields";
import { Field, Option, NewCustomFieldObject } from "../types.d";

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
