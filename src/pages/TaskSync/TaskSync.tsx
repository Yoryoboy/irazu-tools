import { useCallback } from 'react';
import { useTaskSync } from '../../hooks/useTaskSync';
import ExcelUploadCard from '../../features/taskSync/components/ExcelUploadCard';
import NewTasksTableV2 from '../../features/taskSync/components/NewTasksTableV2';

interface Props {
  listId: string;
}

function TaskSync({ listId }: Props) {
  const { loadingClickUp, error, setMqmsRows, newMqmsRows, syncOne, syncAll, removeRowsByExternalId } =
    useTaskSync(listId);

  const handleSyncOne = useCallback(
    async (externalId: string) => {
      const row = newMqmsRows.find(r => r.EXTERNAL_ID === externalId);
      if (!row) return;
      const res = await syncOne(row, listId);
      if (res.success) {
        removeRowsByExternalId([externalId]);
      } else {
        console.error(res.error.message);
      }
    },
    [newMqmsRows, listId, syncOne, removeRowsByExternalId]
  );

  const handleSyncAll = useCallback(async () => {
    if (newMqmsRows.length === 0) return;
    const res = await syncAll(newMqmsRows, listId);
    if (res.success) {
      removeRowsByExternalId(newMqmsRows.map(r => r.EXTERNAL_ID));
    } else {
      console.error(res.error.message);
    }
  }, [newMqmsRows, listId, syncAll, removeRowsByExternalId]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <ExcelUploadCard setData={setMqmsRows} />

      {loadingClickUp && <p className="text-sm text-zinc-400">Obteniendo datos de ClickUp…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {newMqmsRows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Tareas nuevas detectadas ({newMqmsRows.length})</h3>
            <button
              type="button"
              onClick={handleSyncAll}
              className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
            >
              Sincronizar todas
            </button>
          </div>
          <NewTasksTableV2 rows={newMqmsRows} onSyncOne={handleSyncOne} />
        </div>
      )}
    </div>
  );
}

export default TaskSync;
