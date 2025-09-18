import { useCallback, useEffect, useMemo, useState } from 'react';
import { MQMSTask } from '../types/Task';
import ClickUp, { Task as SdkTask } from '@yoryoboy/clickup-sdk';
import { Result } from '../types/AsyncResult';
import { buildClickUpTaskFromMqms, getCustomerCompanyByListId, extractWorkRequestIds } from '../features/taskSync/taskDomain';
import { CLICKUP_API_AKEY } from '../utils/config';

export interface UseTaskSyncState {
  loadingClickUp: boolean;
  error?: string;
  mqmsRows: MQMSTask[];
  setMqmsRows: (rows: MQMSTask[]) => void;
  newMqmsRows: MQMSTask[];
  syncOne: (row: MQMSTask, listId: string) => Promise<Result<{ created: number; tasks: SdkTask[] }>>;
  syncAll: (rows: MQMSTask[], listId: string) => Promise<Result<{ created: number; tasks: SdkTask[] }>>;
  removeRowsByExternalId: (externalIds: string[]) => void;
}

export function useTaskSync(listId: string): UseTaskSyncState {
  const [loadingClickUp, setLoadingClickUp] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [mqmsRows, setMqmsRows] = useState<MQMSTask[]>([]);
  const [clickupTasks, setClickupTasks] = useState<SdkTask[]>([]);

  // Prepare a singleton SDK client with normalized token
  const sdk = useMemo(() => {
    const raw = (CLICKUP_API_AKEY as string) || '';
    const normalized = raw.replace(/^Bearer\s+/i, '');
    return new ClickUp(normalized);
  }, []);

  // Fetch tasks from ClickUp via SDK directly
  useEffect(() => {
    let cancelled = false;
    setLoadingClickUp(true);
    setError(undefined);
    sdk.tasks
      .getTasks({ list_id: listId, page: 'all', include_closed: true })
      .then(tasks => {
        if (cancelled) return;
        setClickupTasks(tasks);
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Unknown error fetching ClickUp tasks';
        setError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingClickUp(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listId, sdk.tasks]);

  const wrIdSet = useMemo(() => extractWorkRequestIds(clickupTasks), [clickupTasks]);

  const newMqmsRows = useMemo(() => {
    if (mqmsRows.length === 0) return [];
    return mqmsRows.filter(r => !wrIdSet.has(r.REQUEST_ID));
  }, [mqmsRows, wrIdSet]);

  const setMqmsRowsCb = useCallback((rows: MQMSTask[]) => setMqmsRows(rows), []);

  const removeRowsByExternalId = useCallback((externalIds: string[]) => {
    setMqmsRows(prev => prev.filter(r => !externalIds.includes(r.EXTERNAL_ID)));
  }, []);

  const syncOne = useCallback(
    async (row: MQMSTask, list: string): Promise<Result<{ created: number; tasks: SdkTask[] }>> => {
      try {
        const customer = getCustomerCompanyByListId(list);
        const payload = buildClickUpTaskFromMqms(row, customer);
        const tasks = await sdk.tasks.createTasks(list, [payload]);
        return { success: true, data: { created: tasks.length, tasks } };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed creating task';
        return { success: false, error: { status: 500, message: msg } };
      }
    },
    [sdk.tasks]
  );

  const syncAll = useCallback(
    async (rows: MQMSTask[], list: string): Promise<Result<{ created: number; tasks: SdkTask[] }>> => {
      try {
        const customer = getCustomerCompanyByListId(list);
        const payloads = rows.map(r => buildClickUpTaskFromMqms(r, customer));
        const tasks = await sdk.tasks.createTasks(list, payloads, { batchSize: 100, delayBetweenBatches: 60000, verbose: true });
        return { success: true, data: { created: tasks.length, tasks } };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed creating tasks';
        return { success: false, error: { status: 500, message: msg } };
      }
    },
    [sdk.tasks]
  );

  return {
    loadingClickUp,
    error,
    mqmsRows,
    setMqmsRows: setMqmsRowsCb,
    newMqmsRows,
    syncOne,
    syncAll,
    removeRowsByExternalId,
  };
}
