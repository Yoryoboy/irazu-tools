import { extractTaskFields, unifyProjects } from '../../utils/helperFunctions';
import { CustomField, ExtractedTaskFieldValues, Task, TaskRow } from '../../types/Task';
import { asbuiltFields, designFields, redesignFields } from './VendorProductionTable.config';
import { codeMapping } from './VendorBauProductionTable.config';

/**
 * Procesa tareas de tipo Asbuilt, Design o Redesign y les asigna un código de proyecto
 */
export function processProjectTasks(
  tasks: Task[],
  fields: string[],
  projectCode: string
): ExtractedTaskFieldValues[] {
  return tasks.map((task) => ({
    ...extractTaskFields(task, fields),
    projectCode,
  }));
}

/**
 * Procesa tareas BAU y las convierte en TaskRow con códigos específicos
 */
export function processBauTasks(bauTasks: Task[]): TaskRow[] {
  const bauFieldsValues = bauTasks.map((task) => {
    const receivedDate = task?.custom_fields?.find(
      (field) => field.name === 'RECEIVED DATE'
    )?.value as string;
    const completionDate = task?.custom_fields?.find(
      (field) => field.name === 'ACTUAL COMPLETION DATE'
    )?.value as string;
    const codes = task?.custom_fields?.filter(
      (field) =>
        field.type === 'number' &&
        field.value &&
        (field.name?.includes('(EA)') ||
          field.name?.includes('(FT)') ||
          field.name?.includes('(HR)') ||
          field.name?.includes('(MILE)'))
    ) as CustomField[];

    return {
      id: task.id as string,
      name: task.name,
      receivedDate: new Date(Number(receivedDate)).toLocaleDateString(),
      completionDate: new Date(Number(completionDate)).toLocaleDateString(),
      codes,
    };
  });

  return bauFieldsValues.reduce((acc: TaskRow[], task) => {
    const row = task?.codes?.map((code) => {
      return {
        id: task.id,
        name: task.name,
        receivedDate: task?.receivedDate,
        completionDate: task?.completionDate,
        quantity: code.value as string,
        projectCode: codeMapping[code.name as string] ?? 'invalid code',
        key: crypto.randomUUID(),
      };
    });
    acc.push(...row);
    return acc;
  }, []);
}

/**
 * Procesa todas las tareas de un vendor que tiene Asbuilt, Design y Redesign
 */
export function processVendorProjectTasks(
  asbuilts: Task[],
  designs: Task[],
  redesigns: Task[]
): ExtractedTaskFieldValues[] {
  const asbuiltTasks = processProjectTasks(asbuilts, asbuiltFields, 'CCI - HS ASBUILT');
  const designTasks = processProjectTasks(designs, designFields, 'CCI - HS DESIGN');
  const redesignTasks = processProjectTasks(redesigns, redesignFields, 'CCI - REDESIGN');

  return unifyProjects(asbuiltTasks, designTasks, redesignTasks);
}
