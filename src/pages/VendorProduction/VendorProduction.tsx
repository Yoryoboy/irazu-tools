import { useEffect, useMemo, useState } from "react";
import { SearchParams, Task } from "../../types";
import { fetchFilteredTasks, getCustomField } from "../../utils/tasksFunctions";

import { CLICKUP_API_AKEY, TEAM_ID, CCI_HS_LIST_ID } from "../../utils/config";
import { vendors } from "./VendorProduction.vendors";

function VendorProduction() {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const checkedForSubcoField = getCustomField("CHECKED FOR SUBCO");
  const asbuiltBillingStatusField = getCustomField("ASBUILT BILLING STATUS");
  const { anaisDelValleArchilaGonzalez } = vendors;
  const searchParams: SearchParams = useMemo(() => {
    return {
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
  }, [
    anaisDelValleArchilaGonzalez,
    asbuiltBillingStatusField,
    checkedForSubcoField,
  ]);

  useEffect(() => {
    fetchFilteredTasks(TEAM_ID, searchParams, CLICKUP_API_AKEY)
      .then((tasks) => {
        setFilteredTasks(tasks);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, [searchParams]);

  return (
    <>
      <p>trabajos asbuilt encontrados {filteredTasks.length}</p>
      <pre style={{ textAlign: "left", lineHeight: "1" }}>
        {JSON.stringify(filteredTasks, null, 2)}
      </pre>
    </>
  );
}

export default VendorProduction;
