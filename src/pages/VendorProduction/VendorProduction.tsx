import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import {
  asbuiltParamsForAnaisDelValleArchilaGonzalez,
  designParamsForAnaisDelValleArchilaGonzalez,
} from "./VendorProduction.SearchParams";
import VendorProductionTable from "./VendorProductionTable";

function VendorProduction() {
  const { filteredTasks: asbuiltForAnaisDelValleArchilaGonzalez } =
    useFilteredTasks(asbuiltParamsForAnaisDelValleArchilaGonzalez);

  const { filteredTasks: designForAnaisDelValleArchilaGonzalez } =
    useFilteredTasks(designParamsForAnaisDelValleArchilaGonzalez);

  return (
    <main>
      <VendorProductionTable
        asbuilts={asbuiltForAnaisDelValleArchilaGonzalez}
        designs={designForAnaisDelValleArchilaGonzalez}
      />
    </main>
  );
}

export default VendorProduction;
