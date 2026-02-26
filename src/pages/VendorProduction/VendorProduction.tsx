import { useFilteredTasks } from '../../hooks/useFilteredTasks';
import {
  getAsbuiltSearchParamsForVendor,
  getDesignSearchParamsForVendor,
  getRedesignSearchParamsForVendor,
} from './VendorProduction.SearchParams';
import VendorProductionTable from './VendorProductionTable';
import { vendors } from './VendorProduction.vendors';
import { useConsolidatedVendorTasks } from './useConsolidatedVendorTasks';
import { useUpdateAllVendorTasks } from './useUpdateAllVendorTasks';
import GlobalUpdateButton from './GlobalUpdateButton';

function VendorProduction() {
  const {
    anaisDelValleArchilaGonzalez,
    // beatrizLeal,
    // nathaly,
    // barbaraGarcia,
    // eliusmir,
    // carlos,
    // rosaAtempa,
    // ximena,
    // ccc,
  } = vendors;

  // Anais Archila

  const { filteredTasks: asbuiltForAnaisDelValleArchilaGonzalez } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  );

  const { filteredTasks: designForAnaisDelValleArchilaGonzalez } = useFilteredTasks(
    getDesignSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  );

  const { filteredTasks: redesignForAnaisDelValleArchilaGonzalez } = useFilteredTasks(
    getRedesignSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  );

  // const { filteredTasks: bauForAnaisDelValleArchilaGonzalez } = useFilteredTasks(
  //   getBAUSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  // );

  // Beatriz Leal
  // const { filteredTasks: asbuiltForBeatrizLeal } = useFilteredTasks(
  //   getAsbuiltSearchParamsForVendor(beatrizLeal.id.toString())
  // );
  // const { filteredTasks: designForBeatrizLeal } = useFilteredTasks(
  //   getDesignSearchParamsForVendor(beatrizLeal.id.toString())
  // );
  // const { filteredTasks: redesignForBeatrizLeal } = useFilteredTasks(
  //   getRedesignSearchParamsForVendor(beatrizLeal.id.toString())
  // );

  // Nathaly
  // const { filteredTasks: asbuiltForNathaly } = useFilteredTasks(
  //   getAsbuiltSearchParamsForVendor(nathaly.id.toString())
  // );
  // const { filteredTasks: designForNathaly } = useFilteredTasks(
  //   getDesignSearchParamsForVendor(nathaly.id.toString())
  // );
  // const { filteredTasks: redesignForNathaly } = useFilteredTasks(
  //   getRedesignSearchParamsForVendor(nathaly.id.toString())
  // );

  // Barbara Garcia
  // const { filteredTasks: bauForBarbaraGarcia } = useFilteredTasks(
  //   getBAUSearchParamsForVendor(barbaraGarcia.id.toString())
  // );

  // Eliusmir
  // const { filteredTasks: bauForEliusmir } = useFilteredTasks(
  //   getBAUSearchParamsForVendor(eliusmir.id.toString())
  // );

  // Carlos
  // const { filteredTasks: bauForCarlos } = useFilteredTasks(
  //   getBAUSearchParamsForVendor(carlos.id.toString())
  // );

  // Rosa Atempa
  // const { filteredTasks: bauForRosaAtempa } = useFilteredTasks(
  //   getBAUSearchParamsForVendor(rosaAtempa.id.toString())
  // );

  // Ximena
  // const { filteredTasks: asbuiltForXimena } = useFilteredTasks(
  //   getAsbuiltSearchParamsForVendor(ximena.id.toString())
  // );
  // const { filteredTasks: designForXimena } = useFilteredTasks(
  //   getDesignSearchParamsForVendor(ximena.id.toString())
  // );
  // const { filteredTasks: redesignForXimena } = useFilteredTasks(
  //   getRedesignSearchParamsForVendor(ximena.id.toString())
  // );

  // CCC
  // const { filteredTasks: asbuiltForCCC } = useFilteredTasks(
  //   getAsbuiltSearchParamsForVendor(ccc.id.toString())
  // );
  // const { filteredTasks: designForCCC } = useFilteredTasks(
  //   getDesignSearchParamsForVendor(ccc.id.toString())
  // );
  // const { filteredTasks: redesignForCCC } = useFilteredTasks(
  //   getRedesignSearchParamsForVendor(ccc.id.toString())
  // );
  // const { filteredTasks: bauForCCC } = useFilteredTasks(
  //   getBAUSearchParamsForVendor(ccc.id.toString())
  // );

  // Consolidar todas las tareas usando el hook personalizado
  const allTasks = useConsolidatedVendorTasks({
    anais: {
      asbuilts: asbuiltForAnaisDelValleArchilaGonzalez,
      designs: designForAnaisDelValleArchilaGonzalez,
      redesigns: redesignForAnaisDelValleArchilaGonzalez,
      // bau: bauForAnaisDelValleArchilaGonzalez,
    },
    beatriz: {
      // asbuilts: asbuiltForBeatrizLeal,
      // designs: designForBeatrizLeal,
      // redesigns: redesignForBeatrizLeal,
    },
    nathaly: {
      // asbuilts: asbuiltForNathaly,
      // designs: designForNathaly,
      // redesigns: redesignForNathaly,
    },
    barbara: {
      // bau: bauForBarbaraGarcia,
    },
    eliusmir: {
      // bau: bauForEliusmir,
    },
    carlos: {
      // bau: bauForCarlos,
    },
    rosa: {
      // bau: bauForRosaAtempa,
    },
    ximena: {
      // asbuilts: asbuiltForXimena,
      // designs: designForXimena,
      // redesigns: redesignForXimena,
    },
    ccc: {
      // asbuilts: asbuiltForCCC,
      // designs: designForCCC,
      // redesigns: redesignForCCC,
      // bau: bauForCCC,
    },
  });

  // Hook para manejar la actualización de todas las tareas
  const { loading, error, handleUpdateAllTasks } = useUpdateAllVendorTasks(allTasks);

  return (
    <main>
      <GlobalUpdateButton
        totalTasks={allTasks.length}
        loading={loading}
        error={error}
        onUpdate={handleUpdateAllTasks}
      />
      {/* <VendorBauProductionTable
        bau={bauForAnaisDelValleArchilaGonzalez}
        vendor={anaisDelValleArchilaGonzalez}
      /> */}
      <VendorProductionTable
        asbuilts={asbuiltForAnaisDelValleArchilaGonzalez}
        designs={designForAnaisDelValleArchilaGonzalez}
        redesigns={redesignForAnaisDelValleArchilaGonzalez}
        vendor={anaisDelValleArchilaGonzalez}
      />
      {/* <VendorProductionTable
        asbuilts={asbuiltForBeatrizLeal}
        designs={designForBeatrizLeal}
        redesigns={redesignForBeatrizLeal}
        vendor={beatrizLeal}
      />
      <VendorProductionTable
        asbuilts={asbuiltForNathaly}
        designs={designForNathaly}
        redesigns={redesignForNathaly}
        vendor={nathaly}
      />
      <VendorBauProductionTable bau={bauForBarbaraGarcia} vendor={barbaraGarcia} />
      <VendorBauProductionTable bau={bauForEliusmir} vendor={eliusmir} />
      <VendorBauProductionTable bau={bauForCarlos} vendor={carlos} />
      <VendorBauProductionTable bau={bauForRosaAtempa} vendor={rosaAtempa} />
      <VendorProductionTable
        asbuilts={asbuiltForXimena}
        designs={designForXimena}
        redesigns={redesignForXimena}
        vendor={ximena}
      />
      <VendorBauProductionTable bau={bauForCCC} vendor={ccc} />
      <VendorProductionTable
        asbuilts={asbuiltForCCC}
        designs={designForCCC}
        redesigns={redesignForCCC}
        vendor={ccc}
      /> */}
    </main>
  );
}

export default VendorProduction;
