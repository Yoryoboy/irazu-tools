import { useEffect, useState } from 'react';
import { Task } from '../types/Task';
import { SearchParams } from '../types/SearchParams';
import { getTasks } from '../utils/clickUpApi';

export function useFetchClickUpTasks(listId: string, searchParams: SearchParams | null) {
  const [clickUpTasks, setClickUpTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{status: number; message: string} | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!listId || !searchParams) return;

      setLoading(true);
      setError(null);
      
      const result = await getTasks(listId, searchParams);
      
      if (result.success) {
        setClickUpTasks(result.data);
      } else {
        console.error('Error fetching tasks:', result.error);
        setError(result.error);
      }
      
      setLoading(false);
    };

    fetchTasks();
  }, [listId, searchParams]);

  return { clickUpTasks, loading, error };
}
