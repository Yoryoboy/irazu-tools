import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import {
  getAsbuiltSearchParamsForVendor,
  getDesignSearchParamsForVendor,
} from "./VendorProduction.SearchParams";
import VendorProductionTable from "./VendorProductionTable";
import { vendors } from "./VendorProduction.vendors";

function VendorProduction() {
  const { anaisDelValleArchilaGonzalez } = vendors;

  const { filteredTasks: asbuiltForAnaisDelValleArchilaGonzalez } =
    useFilteredTasks(
      getAsbuiltSearchParamsForVendor(
        anaisDelValleArchilaGonzalez.id.toString()
      )
    );

  const { filteredTasks: designForAnaisDelValleArchilaGonzalez } =
    useFilteredTasks(
      getDesignSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
    );

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
