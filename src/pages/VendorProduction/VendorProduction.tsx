import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import {
  getAsbuiltSearchParamsForVendor,
  getBAUSearchParamsForVendor,
  getDesignSearchParamsForVendor,
} from "./VendorProduction.SearchParams";
import VendorProductionTable from "./VendorProductionTable";
import { vendors } from "./VendorProduction.vendors";
import VendorBauProductionTable from "./VendorBauProductionTable ";

function VendorProduction() {
  const { anaisDelValleArchilaGonzalez, beatrizLeal, nathaly } = vendors;

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

  const { filteredTasks: bauForAnaisDelValleArchilaGonzalez } =
    useFilteredTasks(
      getBAUSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
    );

  const { filteredTasks: asbuiltForBeatrizLeal } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(beatrizLeal.id.toString())
  );

  const { filteredTasks: designForBeatrizLeal } = useFilteredTasks(
    getDesignSearchParamsForVendor(beatrizLeal.id.toString())
  );

  const { filteredTasks: asbuiltForNathaly } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(nathaly.id.toString())
  );

  const { filteredTasks: designForNathaly } = useFilteredTasks(
    getDesignSearchParamsForVendor(nathaly.id.toString())
  );

  return (
    <main>
      {/* <VendorBauProductionTable
        bau={bauForAnaisDelValleArchilaGonzalez}
        vendor={anaisDelValleArchilaGonzalez}
      /> */}
      <VendorProductionTable
        asbuilts={asbuiltForAnaisDelValleArchilaGonzalez}
        designs={designForAnaisDelValleArchilaGonzalez}
        vendor={anaisDelValleArchilaGonzalez}
      />
      <VendorProductionTable
        asbuilts={asbuiltForBeatrizLeal}
        designs={designForBeatrizLeal}
        vendor={beatrizLeal}
      />
      <VendorProductionTable
        asbuilts={asbuiltForNathaly}
        designs={designForNathaly}
        vendor={nathaly}
      />
    </main>
  );
}

export default VendorProduction;
