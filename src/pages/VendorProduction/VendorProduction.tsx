import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import { asbuiltParamsForAnaisDelValleArchilaGonzalez } from "./VendorProduction.SearchParams";

function VendorProduction() {
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
