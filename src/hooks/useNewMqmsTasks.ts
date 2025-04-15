import { useState, useEffect } from 'react';
import { useFetchClickUpTasks } from './useClickUp';
import { getNewTasksFromMqms } from '@/utils/tasksFunctions';
import { MQMSTask } from '@/types/Task';

export function useNewMqmsTasks(
  mqmsTasks: MQMSTask[],
  listId: string,
  searchParams: Record<string, string>
) {
  const [loading, setLoading] = useState(true);
  const [newMqmsTasks, setNewMqmsTasks] = useState<MQMSTask[]>([]);

  const { clickUpTasks } = useFetchClickUpTasks(listId, searchParams);

  useEffect(() => {
    setLoading(true);

    if (mqmsTasks.length > 0 && clickUpTasks.length > 0) {
      const filtered = getNewTasksFromMqms(mqmsTasks, clickUpTasks);
      setNewMqmsTasks(filtered);
    } else {
      setNewMqmsTasks([]);
    }

    setLoading(false);
  }, [mqmsTasks, clickUpTasks]);

  return {
    newMqmsTasks,
    loading,
  };
}
