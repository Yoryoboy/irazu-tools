import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import ListSelector, { BauType, MainList } from '../../features/taskSync/components/ListSelector';
import TaskSync from './TaskSync';

function TaskSyncListSelector() {
  const [main, setMain] = useState<MainList>(null);
  const [bau, setBau] = useState<BauType>(null);
  const [listId, setListId] = useState<string | null>(null);

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
      <div className="absolute inset-x-0 top-20 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Sincroniza MQMS con ClickUp</h1>
        <p className="text-sm text-zinc-400">
          Selecciona la lista adecuada, importa el Excel y sincroniza solo las tareas que aún no existen en ClickUp.
        </p>
      </div>

      <ListSelector main={main} setMain={setMain} bau={bau} setBau={setBau} onListResolved={setListId} />

      {listId ? (
        <TaskSync listId={listId} />
      ) : (
        <Alert className="border-zinc-800/60 bg-zinc-950/60">
          <AlertTitle>Aún no hay una lista seleccionada</AlertTitle>
          <AlertDescription>
            {main === 'bau'
              ? 'Selecciona un subtipo de BAU para habilitar la sincronización. '
              : 'Elige High Split o BAU para comenzar.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default TaskSyncListSelector;
