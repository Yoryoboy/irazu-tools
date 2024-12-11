import { getCustomField } from "../../utils/tasksFunctions";
import { vendors } from "./VendorProduction.vendors";
import { CCI_HS_LIST_ID } from "../../utils/config";
import { SearchParams } from "../../types";

const checkedForSubcoField = getCustomField("CHECKED FOR SUBCO");
const asbuiltBillingStatusField = getCustomField("ASBUILT BILLING STATUS");
const { anaisDelValleArchilaGonzalez } = vendors;

export const asbuiltParamsForAnaisDelValleArchilaGonzalez: SearchParams = {
  page: "0",
  "assignees[]": anaisDelValleArchilaGonzalez.id.toString(),
  "list_ids[]": CCI_HS_LIST_ID,
  include_closed: "true",
  custom_fields: JSON.stringify([
    {
      field_id: asbuiltBillingStatusField.id,
      operator: "ANY",
      value: [
        asbuiltBillingStatusField.type_config?.options?.[0].id,
        asbuiltBillingStatusField.type_config?.options?.[1].id,
      ],
    },
    {
      field_id: checkedForSubcoField.id,
      operator: "NOT ALL",
      value: [checkedForSubcoField.type_config?.options?.[0].id],
    },
  ]),
};
