import { useMemo } from 'react';
import { ExtractedTaskFieldValues, Task, TaskRow } from '../../types/Task';
import { processBauTasks, processVendorProjectTasks } from './VendorProduction.helpers';

interface VendorTasks {
  asbuilts?: Task[];
  designs?: Task[];
  redesigns?: Task[];
  bau?: Task[];
}

interface UseConsolidatedVendorTasksProps {
  anais: VendorTasks;
  beatriz: VendorTasks;
  nathaly: VendorTasks;
  barbara: VendorTasks;
  eliusmir: VendorTasks;
  carlos: VendorTasks;
  rosa: VendorTasks;
  ximena: VendorTasks;
  ccc: VendorTasks;
}

/**
 * Hook personalizado que consolida todas las tareas de todos los vendors
 * Combina tareas de tipo proyecto (Asbuilt, Design, Redesign) y tareas BAU
 */
export function useConsolidatedVendorTasks({
  anais,
  beatriz,
  nathaly,
  barbara,
  eliusmir,
  carlos,
  rosa,
  ximena,
  ccc,
}: UseConsolidatedVendorTasksProps): (ExtractedTaskFieldValues | TaskRow)[] {
  return useMemo(() => {
    const consolidatedTasks: (ExtractedTaskFieldValues | TaskRow)[] = [];

    // Procesar vendors con tareas de proyecto (Asbuilt, Design, Redesign)
    if (anais.asbuilts && anais.designs && anais.redesigns) {
      const anaisTasks = processVendorProjectTasks(
        anais.asbuilts,
        anais.designs,
        anais.redesigns
      );
      consolidatedTasks.push(...anaisTasks);
    }

    if (beatriz.asbuilts && beatriz.designs && beatriz.redesigns) {
      const beatrizTasks = processVendorProjectTasks(
        beatriz.asbuilts,
        beatriz.designs,
        beatriz.redesigns
      );
      consolidatedTasks.push(...beatrizTasks);
    }

    if (nathaly.asbuilts && nathaly.designs && nathaly.redesigns) {
      const nathalyTasks = processVendorProjectTasks(
        nathaly.asbuilts,
        nathaly.designs,
        nathaly.redesigns
      );
      consolidatedTasks.push(...nathalyTasks);
    }

    // Procesar vendors con tareas BAU
    if (anais.bau) {
      const anaisBau = processBauTasks(anais.bau);
      consolidatedTasks.push(...anaisBau);
    }

    if (barbara.bau) {
      const barbaraBau = processBauTasks(barbara.bau);
      consolidatedTasks.push(...barbaraBau);
    }

    if (eliusmir.bau) {
      const eliusmirBau = processBauTasks(eliusmir.bau);
      consolidatedTasks.push(...eliusmirBau);
    }

    if (carlos.bau) {
      const carlosBau = processBauTasks(carlos.bau);
      consolidatedTasks.push(...carlosBau);
    }

    if (rosa.bau) {
      const rosaBau = processBauTasks(rosa.bau);
      consolidatedTasks.push(...rosaBau);
    }

    if (ximena.bau) {
      const ximenaBau = processBauTasks(ximena.bau);
      consolidatedTasks.push(...ximenaBau);
    }

    if (ccc.bau) {
      const cccBau = processBauTasks(ccc.bau);
      consolidatedTasks.push(...cccBau);
    }

    return consolidatedTasks;
  }, [anais, beatriz, nathaly, barbara, eliusmir, carlos, rosa, ximena, ccc]);
}
