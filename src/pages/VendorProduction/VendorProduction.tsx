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
import { FetchTasksProgress } from '../../utils/tasksFunctions';

function buildQueryStatusLine(
  label: string,
  loading: boolean,
  error: Error | null,
  progress: FetchTasksProgress | null
): string {
  if (error) {
    return `${label}: error`;
  }

  if (loading) {
    if (!progress) {
      return `${label}: loading first request...`;
    }

    const currentPage = progress.currentPage + 1;
    const nextRequest = progress.requestsCompleted + 1;

    return progress.hasMorePages
      ? `${label}: page ${currentPage} done, running request ${nextRequest}...`
      : `${label}: request ${progress.requestsCompleted} done, finalizing...`;
  }

  if (progress) {
    return `${label}: done (${progress.requestsCompleted} requests, ${progress.fetchedTasks} tasks)`;
  }

  return `${label}: done`;
}

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
  const {
    filteredTasks: asbuiltForAnaisDelValleArchilaGonzalez,
    loading: loadingAsbuiltAnais,
    error: errorAsbuiltAnais,
    progress: progressAsbuiltAnais,
  } = useFilteredTasks(
    getAsbuiltSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  );
  const {
    filteredTasks: designForAnaisDelValleArchilaGonzalez,
    loading: loadingDesignAnais,
    error: errorDesignAnais,
    progress: progressDesignAnais,
  } = useFilteredTasks(getDesignSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString()));
  const uncheckedDesignForAnaisDelValleArchilaGonzalez = useMemo(
    () => filterUncheckedDesignTasks(designForAnaisDelValleArchilaGonzalez),
    [designForAnaisDelValleArchilaGonzalez]
  );
  const {
    filteredTasks: redesignForAnaisDelValleArchilaGonzalez,
    loading: loadingRedesignAnais,
    error: errorRedesignAnais,
    progress: progressRedesignAnais,
  } = useFilteredTasks(
    getRedesignSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString())
  );
  const {
    filteredTasks: bauForAnaisDelValleArchilaGonzalez,
    loading: loadingBauAnais,
    error: errorBauAnais,
    progress: progressBauAnais,
  } = useFilteredTasks(getBAUSearchParamsForVendor(anaisDelValleArchilaGonzalez.id.toString()));

  // Beatriz Leal
  const {
    filteredTasks: asbuiltForBeatrizLeal,
    loading: loadingAsbuiltBeatriz,
    error: errorAsbuiltBeatriz,
    progress: progressAsbuiltBeatriz,
  } = useFilteredTasks(getAsbuiltSearchParamsForVendor(beatrizLeal.id.toString()));
  const {
    filteredTasks: designForBeatrizLeal,
    loading: loadingDesignBeatriz,
    error: errorDesignBeatriz,
    progress: progressDesignBeatriz,
  } = useFilteredTasks(getDesignSearchParamsForVendor(beatrizLeal.id.toString()));
  const uncheckedDesignForBeatrizLeal = useMemo(
    () => filterUncheckedDesignTasks(designForBeatrizLeal),
    [designForBeatrizLeal]
  );
  const {
    filteredTasks: redesignForBeatrizLeal,
    loading: loadingRedesignBeatriz,
    error: errorRedesignBeatriz,
    progress: progressRedesignBeatriz,
  } = useFilteredTasks(getRedesignSearchParamsForVendor(beatrizLeal.id.toString()));

  // Nathaly
  const {
    filteredTasks: asbuiltForNathaly,
    loading: loadingAsbuiltNathaly,
    error: errorAsbuiltNathaly,
    progress: progressAsbuiltNathaly,
  } = useFilteredTasks(getAsbuiltSearchParamsForVendor(nathaly.id.toString()));
  const {
    filteredTasks: designForNathaly,
    loading: loadingDesignNathaly,
    error: errorDesignNathaly,
    progress: progressDesignNathaly,
  } = useFilteredTasks(getDesignSearchParamsForVendor(nathaly.id.toString()));
  const uncheckedDesignForNathaly = useMemo(
    () => filterUncheckedDesignTasks(designForNathaly),
    [designForNathaly]
  );
  const {
    filteredTasks: redesignForNathaly,
    loading: loadingRedesignNathaly,
    error: errorRedesignNathaly,
    progress: progressRedesignNathaly,
  } = useFilteredTasks(getRedesignSearchParamsForVendor(nathaly.id.toString()));

  // Barbara Garcia
  const {
    filteredTasks: bauForBarbaraGarcia,
    loading: loadingBauBarbara,
    error: errorBauBarbara,
    progress: progressBauBarbara,
  } = useFilteredTasks(getBAUSearchParamsForVendor(barbaraGarcia.id.toString()));

  // Eliusmir
  const {
    filteredTasks: bauForEliusmir,
    loading: loadingBauEliusmir,
    error: errorBauEliusmir,
    progress: progressBauEliusmir,
  } = useFilteredTasks(getBAUSearchParamsForVendor(eliusmir.id.toString()));

  // Carlos
  const {
    filteredTasks: bauForCarlos,
    loading: loadingBauCarlos,
    error: errorBauCarlos,
    progress: progressBauCarlos,
  } = useFilteredTasks(getBAUSearchParamsForVendor(carlos.id.toString()));

  // Rosa Atempa
  const {
    filteredTasks: bauForRosaAtempa,
    loading: loadingBauRosa,
    error: errorBauRosa,
    progress: progressBauRosa,
  } = useFilteredTasks(getBAUSearchParamsForVendor(rosaAtempa.id.toString()));

  // Ximena
  const {
    filteredTasks: asbuiltForXimena,
    loading: loadingAsbuiltXimena,
    error: errorAsbuiltXimena,
    progress: progressAsbuiltXimena,
  } = useFilteredTasks(getAsbuiltSearchParamsForVendor(ximena.id.toString()));
  const {
    filteredTasks: designForXimena,
    loading: loadingDesignXimena,
    error: errorDesignXimena,
    progress: progressDesignXimena,
  } = useFilteredTasks(getDesignSearchParamsForVendor(ximena.id.toString()));
  const uncheckedDesignForXimena = useMemo(
    () => filterUncheckedDesignTasks(designForXimena),
    [designForXimena]
  );
  const {
    filteredTasks: redesignForXimena,
    loading: loadingRedesignXimena,
    error: errorRedesignXimena,
    progress: progressRedesignXimena,
  } = useFilteredTasks(getRedesignSearchParamsForVendor(ximena.id.toString()));

  // CCC
  const {
    filteredTasks: asbuiltForCCC,
    loading: loadingAsbuiltCCC,
    error: errorAsbuiltCCC,
    progress: progressAsbuiltCCC,
  } = useFilteredTasks(getAsbuiltSearchParamsForVendor(ccc.id.toString()));
  const {
    filteredTasks: designForCCC,
    loading: loadingDesignCCC,
    error: errorDesignCCC,
    progress: progressDesignCCC,
  } = useFilteredTasks(getDesignSearchParamsForVendor(ccc.id.toString()));
  const uncheckedDesignForCCC = useMemo(
    () => filterUncheckedDesignTasks(designForCCC),
    [designForCCC]
  );
  const {
    filteredTasks: redesignForCCC,
    loading: loadingRedesignCCC,
    error: errorRedesignCCC,
    progress: progressRedesignCCC,
  } = useFilteredTasks(getRedesignSearchParamsForVendor(ccc.id.toString()));
  const {
    filteredTasks: bauForCCC,
    loading: loadingBauCCC,
    error: errorBauCCC,
    progress: progressBauCCC,
  } = useFilteredTasks(getBAUSearchParamsForVendor(ccc.id.toString()));

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
        isFetching={loadingBauAnais}
        statusLines={[
          buildQueryStatusLine('BAU', loadingBauAnais, errorBauAnais, progressBauAnais),
        ]}
      />
      <VendorProductionTable
        asbuilts={asbuiltForAnaisDelValleArchilaGonzalez}
        designs={uncheckedDesignForAnaisDelValleArchilaGonzalez}
        redesigns={redesignForAnaisDelValleArchilaGonzalez}
        vendor={anaisDelValleArchilaGonzalez}
        isFetching={loadingAsbuiltAnais || loadingDesignAnais || loadingRedesignAnais}
        statusLines={[
          buildQueryStatusLine('Asbuilt', loadingAsbuiltAnais, errorAsbuiltAnais, progressAsbuiltAnais),
          buildQueryStatusLine('Design', loadingDesignAnais, errorDesignAnais, progressDesignAnais),
          buildQueryStatusLine(
            'Redesign',
            loadingRedesignAnais,
            errorRedesignAnais,
            progressRedesignAnais
          ),
        ]}
      />
      <VendorProductionTable
        asbuilts={asbuiltForBeatrizLeal}
        designs={uncheckedDesignForBeatrizLeal}
        redesigns={redesignForBeatrizLeal}
        vendor={beatrizLeal}
        isFetching={loadingAsbuiltBeatriz || loadingDesignBeatriz || loadingRedesignBeatriz}
        statusLines={[
          buildQueryStatusLine(
            'Asbuilt',
            loadingAsbuiltBeatriz,
            errorAsbuiltBeatriz,
            progressAsbuiltBeatriz
          ),
          buildQueryStatusLine('Design', loadingDesignBeatriz, errorDesignBeatriz, progressDesignBeatriz),
          buildQueryStatusLine(
            'Redesign',
            loadingRedesignBeatriz,
            errorRedesignBeatriz,
            progressRedesignBeatriz
          ),
        ]}
      />
      <VendorProductionTable
        asbuilts={asbuiltForNathaly}
        designs={uncheckedDesignForNathaly}
        redesigns={redesignForNathaly}
        vendor={nathaly}
        isFetching={loadingAsbuiltNathaly || loadingDesignNathaly || loadingRedesignNathaly}
        statusLines={[
          buildQueryStatusLine(
            'Asbuilt',
            loadingAsbuiltNathaly,
            errorAsbuiltNathaly,
            progressAsbuiltNathaly
          ),
          buildQueryStatusLine('Design', loadingDesignNathaly, errorDesignNathaly, progressDesignNathaly),
          buildQueryStatusLine(
            'Redesign',
            loadingRedesignNathaly,
            errorRedesignNathaly,
            progressRedesignNathaly
          ),
        ]}
      />
      <VendorBauProductionTable
        bau={bauForBarbaraGarcia}
        vendor={barbaraGarcia}
        isFetching={loadingBauBarbara}
        statusLines={[
          buildQueryStatusLine('BAU', loadingBauBarbara, errorBauBarbara, progressBauBarbara),
        ]}
      />
      <VendorBauProductionTable
        bau={bauForEliusmir}
        vendor={eliusmir}
        isFetching={loadingBauEliusmir}
        statusLines={[
          buildQueryStatusLine('BAU', loadingBauEliusmir, errorBauEliusmir, progressBauEliusmir),
        ]}
      />
      <VendorBauProductionTable
        bau={bauForCarlos}
        vendor={carlos}
        isFetching={loadingBauCarlos}
        statusLines={[
          buildQueryStatusLine('BAU', loadingBauCarlos, errorBauCarlos, progressBauCarlos),
        ]}
      />
      <VendorBauProductionTable
        bau={bauForRosaAtempa}
        vendor={rosaAtempa}
        isFetching={loadingBauRosa}
        statusLines={[
          buildQueryStatusLine('BAU', loadingBauRosa, errorBauRosa, progressBauRosa),
        ]}
      />
      <VendorProductionTable
        asbuilts={asbuiltForXimena}
        designs={uncheckedDesignForXimena}
        redesigns={redesignForXimena}
        vendor={ximena}
        isFetching={loadingAsbuiltXimena || loadingDesignXimena || loadingRedesignXimena}
        statusLines={[
          buildQueryStatusLine(
            'Asbuilt',
            loadingAsbuiltXimena,
            errorAsbuiltXimena,
            progressAsbuiltXimena
          ),
          buildQueryStatusLine('Design', loadingDesignXimena, errorDesignXimena, progressDesignXimena),
          buildQueryStatusLine(
            'Redesign',
            loadingRedesignXimena,
            errorRedesignXimena,
            progressRedesignXimena
          ),
        ]}
      />
      <VendorBauProductionTable
        bau={bauForCCC}
        vendor={ccc}
        isFetching={loadingBauCCC}
        statusLines={[
          buildQueryStatusLine('BAU', loadingBauCCC, errorBauCCC, progressBauCCC),
        ]}
      />
      <VendorProductionTable
        asbuilts={asbuiltForCCC}
        designs={uncheckedDesignForCCC}
        redesigns={redesignForCCC}
        vendor={ccc}
        isFetching={loadingAsbuiltCCC || loadingDesignCCC || loadingRedesignCCC}
        statusLines={[
          buildQueryStatusLine('Asbuilt', loadingAsbuiltCCC, errorAsbuiltCCC, progressAsbuiltCCC),
          buildQueryStatusLine('Design', loadingDesignCCC, errorDesignCCC, progressDesignCCC),
          buildQueryStatusLine(
            'Redesign',
            loadingRedesignCCC,
            errorRedesignCCC,
            progressRedesignCCC
          ),
        ]}
      />
    </main>
  );
}

export default VendorProduction;
