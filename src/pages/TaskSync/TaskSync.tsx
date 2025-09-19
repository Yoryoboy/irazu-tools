import { useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import ExcelUploadCard from '../../features/taskSync/components/ExcelUploadCard';
import NewTasksTableV2 from '../../features/taskSync/components/NewTasksTableV2';
import { useTaskSync } from '../../hooks/useTaskSync';

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
    <div className="space-y-10">
      <ExcelUploadCard setData={setMqmsRows} />

      {loadingClickUp && (
        <Alert variant="info" className="border-emerald-400/40 bg-emerald-500/15 text-emerald-100">
          <AlertTitle>Consultando ClickUp…</AlertTitle>
          <AlertDescription>Obteniendo tareas existentes para evitar duplicados.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="border-red-500/60 bg-red-500/10 text-red-200">
          <AlertTitle>Ocurrió un error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {newMqmsRows.length > 0 && (
        <Card className="border-slate-800/70 bg-slate-900/70 shadow-[0_40px_120px_-60px_rgba(16,185,129,0.55)]">
          <CardHeader className="gap-6">
            <div className="flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-[0.35em] text-emerald-300">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-xs font-semibold text-emerald-200">
                PASO 3
              </span>
              <span className="font-semibold tracking-[0.28em] text-emerald-200">Valida y sincroniza</span>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1 text-slate-100">
                <CardTitle className="text-2xl font-semibold">Tareas nuevas detectadas</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  {newMqmsRows.length} {newMqmsRows.length === 1 ? 'fila lista' : 'filas listas'} para sincronizar con ClickUp.
                </CardDescription>
              </div>
              <Button
                onClick={handleSyncAll}
                className="w-full md:w-auto"
                disabled={newMqmsRows.length === 0}
              >
                Sincronizar todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <NewTasksTableV2 rows={newMqmsRows} onSyncOne={handleSyncOne} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TaskSync;
