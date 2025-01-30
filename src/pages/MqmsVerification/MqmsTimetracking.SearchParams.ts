import { CLICKUP_LIST_IDS } from "../../utils/config";
import { getCustomField } from "../../utils/tasksFunctions";

const { cciBau, cciHs } = CLICKUP_LIST_IDS;

export const BAU_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS = {
  page: "0",
  "list_ids[]": cciBau,
  include_closed: "true",
  "statuses[]": ["approved"],
  custom_fields: JSON.stringify([
    {
      field_id: getCustomField("Timetracked").id,
      operator: "IS NULL",
    },
  ]),
};

export const HS_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS = {
  page: "0",
  "list_ids[]": cciHs,
  include_closed: "true",
  "statuses[]": ["approved"],
  custom_fields: JSON.stringify([
    {
      field_id: getCustomField("Timetracked").id,
      operator: "IS NULL",
    },
  ]),
};
