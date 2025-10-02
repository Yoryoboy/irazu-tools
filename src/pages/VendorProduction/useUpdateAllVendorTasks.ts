import { useState } from 'react';
import { notification } from 'antd';
import { ExtractedTaskFieldValues, TaskRow } from '../../types/Task';
import { getCheckedSubcoBillingStatusPayloads, sendBatchedRequests } from '../../utils/helperFunctions';
import { updateCustomFieldLabel } from '../../utils/clickUpApi';

/**
 * Hook personalizado para manejar la actualización masiva de tareas de vendors
 * Incluye lógica de rate limiting y manejo de errores
 */
export function useUpdateAllVendorTasks(allTasks: (ExtractedTaskFieldValues | TaskRow)[]) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateAllTasks = async () => {
    setLoading(true);
    setError(null);

    // Cast necesario porque allTasks es un array mixto pero la función acepta ambos tipos
    const checkedSubcoBillingStatusPayloads = getCheckedSubcoBillingStatusPayloads(
      allTasks as ExtractedTaskFieldValues[]
    );

    console.log(
      `Preparing to update ${checkedSubcoBillingStatusPayloads.length} tasks from all vendors...`
    );

    try {
      // Usar sendBatchedRequests para respetar el rate limit de ClickUp (100 req/min)
      const results = await sendBatchedRequests(
        checkedSubcoBillingStatusPayloads,
        80, // Batch size: 80 requests por lote
        async (payload) => {
          const { taskId, customFieldId, value } = payload;
          if (!taskId || !customFieldId || value === undefined) {
            throw new Error('Missing required parameters');
          }
          return await updateCustomFieldLabel(taskId, customFieldId, value);
        }
      );

      setLoading(false);

      // Calcular éxitos y fallos
      const successes = results.filter((result) => result.success);
      const errors = results.filter((result) => !result.success);

      if (errors.length > 0) {
        setError(`${errors.length} tasks failed to update. Check console for details.`);
        notification.error({
          message: 'Error',
          description: `${errors.length} tasks failed to update.`,
        });
        console.error('Failed tasks:', errors);
      }

      if (successes.length > 0) {
        notification.success({
          message: 'Success',
          description: `${successes.length} tasks updated successfully across all vendors!`,
          duration: 5,
        });
      }
    } catch (error) {
      setLoading(false);
      setError('An unexpected error occurred. Check console for details.');
      notification.error({
        message: 'Error',
        description: 'An unexpected error occurred while updating tasks.',
      });
      console.error('Error in handleUpdateAllTasks:', error);
    }
  };

  return {
    loading,
    error,
    handleUpdateAllTasks,
  };
}
