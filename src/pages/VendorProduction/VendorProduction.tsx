import { useMemo } from 'react';
import { useFilteredTasks } from '../../hooks/useFilteredTasks';
import {
  getAsbuiltSearchParamsForVendor,
  getBAUSearchParamsForVendor,
  getDesignSearchParamsForVendor,
  getRedesignSearchParamsForVendor,
} from './VendorProduction.SearchParams';
import VendorProductionTable from './VendorProductionTable';
import { vendors } from './VendorProduction.vendors';
import VendorBauProductionTable from './VendorBauProductionTable';
import { useConsolidatedVendorTasks } from './useConsolidatedVendorTasks';
import { useUpdateAllVendorTasks } from './useUpdateAllVendorTasks';
import GlobalUpdateButton from './GlobalUpdateButton';
import { filterUncheckedDesignTasks } from './VendorProduction.helpers';

function VendorProduction() {
  const {
    anaisDelValleArchilaGonzalez,
    beatrizLeal,
    nathaly,
    barbaraGarcia,
    eliusmir,
    carlos,
    rosaAtempa,
    ximena,
    ccc,
  } = vendors;

  // Anais Archila
  const { filteredTasks: asbuiltForAnaisDelValleArchilaGonzalez } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  );
  const { filteredTasks: designForAnaisDelValleArchilaGonzalez } = useFilteredTasks(
    getDesignSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  );
  const uncheckedDesignForAnaisDelValleArchilaGonzalez = useMemo(
    () => filterUncheckedDesignTasks(designForAnaisDelValleArchilaGonzalez),
    [designForAnaisDelValleArchilaGonzalez]
  );
  const { filteredTasks: redesignForAnaisDelValleArchilaGonzalez } = useFilteredTasks(
    getRedesignSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  );
  const { filteredTasks: bauForAnaisDelValleArchilaGonzalez } = useFilteredTasks(
    getBAUSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  );

  // Beatriz Leal
  const { filteredTasks: asbuiltForBeatrizLeal } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(beatrizLeal.id.toString())
  );
  const { filteredTasks: designForBeatrizLeal } = useFilteredTasks(
    getDesignSearchParamsForVendor(beatrizLeal.id.toString())
  );
  const uncheckedDesignForBeatrizLeal = useMemo(
    () => filterUncheckedDesignTasks(designForBeatrizLeal),
    [designForBeatrizLeal]
  );
  const { filteredTasks: redesignForBeatrizLeal } = useFilteredTasks(
    getRedesignSearchParamsForVendor(beatrizLeal.id.toString())
  );

  // Nathaly
  const { filteredTasks: asbuiltForNathaly } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(nathaly.id.toString())
  );
  const { filteredTasks: designForNathaly } = useFilteredTasks(
    getDesignSearchParamsForVendor(nathaly.id.toString())
  );
  const uncheckedDesignForNathaly = useMemo(
    () => filterUncheckedDesignTasks(designForNathaly),
    [designForNathaly]
  );
  const { filteredTasks: redesignForNathaly } = useFilteredTasks(
    getRedesignSearchParamsForVendor(nathaly.id.toString())
  );

  // Barbara Garcia
  const { filteredTasks: bauForBarbaraGarcia } = useFilteredTasks(
    getBAUSearchParamsForVendor(barbaraGarcia.id.toString())
  );

  // Eliusmir
  const { filteredTasks: bauForEliusmir } = useFilteredTasks(
    getBAUSearchParamsForVendor(eliusmir.id.toString())
  );

  // Carlos
  const { filteredTasks: bauForCarlos } = useFilteredTasks(
    getBAUSearchParamsForVendor(carlos.id.toString())
  );

  // Rosa Atempa
  const { filteredTasks: bauForRosaAtempa } = useFilteredTasks(
    getBAUSearchParamsForVendor(rosaAtempa.id.toString())
  );

  // Ximena
  const { filteredTasks: asbuiltForXimena } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(ximena.id.toString())
  );
  const { filteredTasks: designForXimena } = useFilteredTasks(
    getDesignSearchParamsForVendor(ximena.id.toString())
  );
  const uncheckedDesignForXimena = useMemo(
    () => filterUncheckedDesignTasks(designForXimena),
    [designForXimena]
  );
  const { filteredTasks: redesignForXimena } = useFilteredTasks(
    getRedesignSearchParamsForVendor(ximena.id.toString())
  );

  // CCC
  const { filteredTasks: asbuiltForCCC } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(ccc.id.toString())
  );
  const { filteredTasks: designForCCC } = useFilteredTasks(
    getDesignSearchParamsForVendor(ccc.id.toString())
  );
  const uncheckedDesignForCCC = useMemo(
    () => filterUncheckedDesignTasks(designForCCC),
    [designForCCC]
  );
  const { filteredTasks: redesignForCCC } = useFilteredTasks(
    getRedesignSearchParamsForVendor(ccc.id.toString())
  );
  const { filteredTasks: bauForCCC } = useFilteredTasks(
    getBAUSearchParamsForVendor(ccc.id.toString())
  );

  const allTasks = useConsolidatedVendorTasks({
    anais: {
      asbuilts: asbuiltForAnaisDelValleArchilaGonzalez,
      designs: uncheckedDesignForAnaisDelValleArchilaGonzalez,
      redesigns: redesignForAnaisDelValleArchilaGonzalez,
      bau: bauForAnaisDelValleArchilaGonzalez,
    },
    beatriz: {
      asbuilts: asbuiltForBeatrizLeal,
      designs: uncheckedDesignForBeatrizLeal,
      redesigns: redesignForBeatrizLeal,
    },
    nathaly: {
      asbuilts: asbuiltForNathaly,
      designs: uncheckedDesignForNathaly,
      redesigns: redesignForNathaly,
    },
    barbara: {
      bau: bauForBarbaraGarcia,
    },
    eliusmir: {
      bau: bauForEliusmir,
    },
    carlos: {
      bau: bauForCarlos,
    },
    rosa: {
      bau: bauForRosaAtempa,
    },
    ximena: {
      asbuilts: asbuiltForXimena,
      designs: uncheckedDesignForXimena,
      redesigns: redesignForXimena,
    },
    ccc: {
      asbuilts: asbuiltForCCC,
      designs: uncheckedDesignForCCC,
      redesigns: redesignForCCC,
      bau: bauForCCC,
    },
  });

  const { loading, error, handleUpdateAllTasks } = useUpdateAllVendorTasks(allTasks);

  return (
    <main>
      <GlobalUpdateButton
        totalTasks={allTasks.length}
        loading={loading}
        error={error}
        onUpdate={handleUpdateAllTasks}
      />
      <VendorBauProductionTable
        bau={bauForAnaisDelValleArchilaGonzalez}
        vendor={anaisDelValleArchilaGonzalez}
      />
      <VendorProductionTable
        asbuilts={asbuiltForAnaisDelValleArchilaGonzalez}
        designs={uncheckedDesignForAnaisDelValleArchilaGonzalez}
        redesigns={redesignForAnaisDelValleArchilaGonzalez}
        vendor={anaisDelValleArchilaGonzalez}
      />
      <VendorProductionTable
        asbuilts={asbuiltForBeatrizLeal}
        designs={uncheckedDesignForBeatrizLeal}
        redesigns={redesignForBeatrizLeal}
        vendor={beatrizLeal}
      />
      <VendorProductionTable
        asbuilts={asbuiltForNathaly}
        designs={uncheckedDesignForNathaly}
        redesigns={redesignForNathaly}
        vendor={nathaly}
      />
      <VendorBauProductionTable bau={bauForBarbaraGarcia} vendor={barbaraGarcia} />
      <VendorBauProductionTable bau={bauForEliusmir} vendor={eliusmir} />
      <VendorBauProductionTable bau={bauForCarlos} vendor={carlos} />
      <VendorBauProductionTable bau={bauForRosaAtempa} vendor={rosaAtempa} />
      <VendorProductionTable
        asbuilts={asbuiltForXimena}
        designs={uncheckedDesignForXimena}
        redesigns={redesignForXimena}
        vendor={ximena}
      />
      <VendorBauProductionTable bau={bauForCCC} vendor={ccc} />
      <VendorProductionTable
        asbuilts={asbuiltForCCC}
        designs={uncheckedDesignForCCC}
        redesigns={redesignForCCC}
        vendor={ccc}
      />
    </main>
  );
}

export default VendorProduction;
