import { useEffect, useMemo, useState } from "react";
import { SearchParams, Task } from "../../types";
import {
  fetchAsbuiltsByAssignee,
  getCustomField,
} from "../../utils/tasksFunctions";

import { CLICKUP_API_AKEY, teamId } from "../../utils/config";

function VendorProduction() {
  const [asbuilts, setAsbuilts] = useState<Task[]>([]);
  const checkedForSubcoField = getCustomField("CHECKED FOR SUBCO");
  const asbuiltBillingStatusField = getCustomField("ASBUILT BILLING STATUS");

  const searchParams: SearchParams = useMemo(() => {
    return {
      assignee: teamId,
      page: "0",
      "assignees[]": "43076422",
      "list_ids[]": "900200859937",
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
  }, [asbuiltBillingStatusField, checkedForSubcoField]);

  useEffect(() => {
    fetchAsbuiltsByAssignee(teamId, searchParams, CLICKUP_API_AKEY)
      .then((tasks) => {
        setAsbuilts(tasks);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, [searchParams]);

  return (
    <>
      <p>trabajos asbuilt encontrados {asbuilts.length}</p>
      <pre style={{ textAlign: "left", lineHeight: "1" }}>
        {JSON.stringify(asbuilts, null, 2)}
      </pre>
    </>
  );
}

export default VendorProduction;
