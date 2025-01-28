import { CLICKUP_LIST_IDS } from "../../utils/config";
import { getCustomField } from "../../utils/tasksFunctions";

const { cciBau } = CLICKUP_LIST_IDS;

export const APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS = {
  page: "0",
  "list_ids[]": cciBau,
  include_closed: "true",
  // "assignees[]": "82212594",
  "statuses[]": ["approved"],
  custom_fields: JSON.stringify([
    {
      field_id: getCustomField("Timetracked").id,
      operator: "IS NULL",
    },
  ]),
};
