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
    <div className="space-y-8">
      <ExcelUploadCard setData={setMqmsRows} />

      {loadingClickUp && (
        <Alert variant="info">
          <AlertTitle>Consultando ClickUp…</AlertTitle>
          <AlertDescription>Obteniendo tareas existentes para evitar duplicados.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Ocurrió un error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {newMqmsRows.length > 0 && (
        <Card className="border-zinc-800/60">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle>Tareas nuevas detectadas</CardTitle>
              <CardDescription>
                {newMqmsRows.length} {newMqmsRows.length === 1 ? 'fila lista' : 'filas listas'} para sincronizar con ClickUp.
              </CardDescription>
            </div>
            <Button onClick={handleSyncAll} className="w-full md:w-auto" disabled={newMqmsRows.length === 0}>
              Sincronizar todas
            </Button>
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
