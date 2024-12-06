import { useEffect, useState } from "react";
import {
  UseFilteredClickUpTasksProps,
  UseFilteredClickUpTasksReturn,
} from "../types.d";

const CLICKUP_API_AKEY = import.meta.env.VITE_CLICKUP_API_AKEY;

import { Clickupdataresponse, Task } from "../types";

export function useFetchClickUpTasks(listId: string) {
  const [clickUpTasks, setClickUpTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      let allTasks: Task[] = [];
      let page = 0;
      let lastPage = false;

      do {
        const query = new URLSearchParams({
          page: page.toString(),
          // include_closed: "true",
        }).toString();

        try {
          const response = await fetch(
            `https://api.clickup.com/api/v2/list/${listId}/task?${query}`,
            {
              method: "GET",
              headers: {
                Authorization: CLICKUP_API_AKEY || "",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
          }

          const data: Clickupdataresponse = await response.json();
          allTasks = [...allTasks, ...data.tasks];
          lastPage = data.last_page;
          page += 1;
        } catch (error) {
          console.error("Error fetching tasks:", error);
          lastPage = true;
        }
      } while (!lastPage);

      setClickUpTasks(allTasks);
    };

    fetchTasks();
  }, [listId]);

  return { clickUpTasks };
}

export function useFilteredClickUpTasks<T>({
  teamId,
  queryParams,
}: UseFilteredClickUpTasksProps): UseFilteredClickUpTasksReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams(queryParams).toString();
        const response = await fetch(
          `https://api.clickup.com/api/v2/team/${teamId}/task?${query}`,
          {
            method: "GET",
            headers: {
              Authorization: CLICKUP_API_AKEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching tasks: ${response.status} - ${response.statusText}`
          );
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [teamId, queryParams]);

  return { data, isLoading, error };
}
