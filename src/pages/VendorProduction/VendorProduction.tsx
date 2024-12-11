import { useMemo } from "react";
import { SearchParams } from "../../types";
import { getCustomField } from "../../utils/tasksFunctions";
import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import { CCI_HS_LIST_ID } from "../../utils/config";
import { vendors } from "./VendorProduction.vendors";

function VendorProduction() {
  const checkedForSubcoField = getCustomField("CHECKED FOR SUBCO");
  const asbuiltBillingStatusField = getCustomField("ASBUILT BILLING STATUS");
  const { anaisDelValleArchilaGonzalez } = vendors;

  const asbuiltParamsForAnaisDelValleArchilaGonzalez: SearchParams =
    useMemo(() => {
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

  const {
    filteredTasks: asbuiltForAnaisDelValleArchilaGonzalez,
    loading: anaisAsbuiltLoading,
    error: anaisAsbuiltError,
  } = useFilteredTasks(asbuiltParamsForAnaisDelValleArchilaGonzalez);

  return (
    <div>
      {anaisAsbuiltError && <div>Error: {anaisAsbuiltError.message}</div>}
      {anaisAsbuiltLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <p>
            trabajos asbuilt encontrados{" "}
            {asbuiltForAnaisDelValleArchilaGonzalez.length}
          </p>
          <pre style={{ textAlign: "left", lineHeight: "1" }}>
            {JSON.stringify(asbuiltForAnaisDelValleArchilaGonzalez, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}

export default VendorProduction;
