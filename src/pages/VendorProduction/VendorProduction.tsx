import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import {
  asbuiltParamsForAnaisDelValleArchilaGonzalez,
  designParamsForAnaisDelValleArchilaGonzalez,
} from "./VendorProduction.SearchParams";
import VendorProductionTable from "./VendorProductionTable";
import { vendors } from "./VendorProduction.vendors";

function VendorProduction() {
  const { anaisDelValleArchilaGonzalez } = vendors;

  const { filteredTasks: asbuiltForAnaisDelValleArchilaGonzalez } =
    useFilteredTasks(asbuiltParamsForAnaisDelValleArchilaGonzalez);

  const { filteredTasks: designForAnaisDelValleArchilaGonzalez } =
    useFilteredTasks(designParamsForAnaisDelValleArchilaGonzalez);

  return (
    <main>
      <VendorProductionTable
        asbuilts={asbuiltForAnaisDelValleArchilaGonzalez}
        designs={designForAnaisDelValleArchilaGonzalez}
        vendor={anaisDelValleArchilaGonzalez}
      />
    </main>
  );
}

export default VendorProduction;
