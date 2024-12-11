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
        <div>
          <h1>Asbuilts for Anais Del Valle Archila Gonzalez</h1>
          {asbuiltForAnaisDelValleArchilaGonzalez.map((task) => (
            <div style={{ lineHeight: "1.5" }} key={task.id}>
              <h2>{task.name}</h2>
              <p>{task.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VendorProduction;
