import { CLICKUP_LIST_IDS } from "../../../utils/config";
import { getCustomField } from "../../../utils/tasksFunctions";

const { cciBau, cciHs } = CLICKUP_LIST_IDS;

const TIMETRACKED_FIELD_ID = getCustomField("Timetracked").id;
const WORK_REQUEST_FIELD_ID = getCustomField("WORK REQUEST ID").id;

export const BAU_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS = {
  page: "0",
  "list_ids[]": cciBau,
  include_closed: "true",
  "statuses[]": ["approved"],
  custom_fields: JSON.stringify([
    {
      field_id: TIMETRACKED_FIELD_ID,
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
      field_id: WORK_REQUEST_FIELD_ID,
      operator: "IS NOT NULL",
    },
    {
      field_id: TIMETRACKED_FIELD_ID,
      operator: "IS NULL",
    },
  ]),
};
