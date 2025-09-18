import { useState } from 'react';
import ListSelector, { BauType, MainList } from '../../features/taskSync/components/ListSelector';
import TaskSync from './TaskSync';

function TaskSyncListSelector() {
  const [main, setMain] = useState<MainList>(null);
  const [bau, setBau] = useState<BauType>(null);
  const [listId, setListId] = useState<string | null>(null);

  return (
    <div className="w-full px-4">
      <ListSelector
        main={main}
        setMain={setMain}
        bau={bau}
        setBau={setBau}
        onListResolved={setListId}
      />
      {listId ? (
        <div className="mt-6">
          <TaskSync listId={listId} />
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-zinc-400">
          Seleccione una lista{main === 'bau' ? ' y un tipo de BAU' : ''}
        </p>
      )}
    </div>
  );
}

export default TaskSyncListSelector;
