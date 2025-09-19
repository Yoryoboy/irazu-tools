import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import ListSelector, { BauType, MainList } from '../../features/taskSync/components/ListSelector';
import TaskSync from './TaskSync';

function TaskSyncListSelector() {
  const [main, setMain] = useState<MainList>(null);
  const [bau, setBau] = useState<BauType>(null);
  const [listId, setListId] = useState<string | null>(null);

  return (
    <div className="relative isolate overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-emerald-500/25 via-transparent to-transparent blur-3xl" />
        <div className="absolute -left-32 top-48 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:px-10">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Task Sync</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
            Sincroniza MQMS con ClickUp sin perder contexto
          </h1>
          <p className="mt-4 text-base text-slate-400">
            Elige la lista correcta, importa el Excel y valida qué tareas aún no existen en ClickUp antes de sincronizar.
          </p>
        </header>

        <ListSelector main={main} setMain={setMain} bau={bau} setBau={setBau} onListResolved={setListId} />

        {listId ? (
          <TaskSync listId={listId} />
        ) : (
          <Alert className="border-slate-800/70 bg-slate-900/70 text-slate-200">
            <AlertTitle>Aún no hay una lista seleccionada</AlertTitle>
            <AlertDescription>
              {main === 'bau'
                ? 'Selecciona un subtipo de BAU para habilitar la sincronización.'
                : 'Elige High Split o BAU para comenzar.'}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default TaskSyncListSelector;
