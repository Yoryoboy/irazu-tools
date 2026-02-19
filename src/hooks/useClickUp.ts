import { useEffect, useState } from "react";
import { CLICKUP_API_AKEY } from "../utils/config";
import { Task } from "../types/Task";
import { SearchParams } from "../types/SearchParams";

export function useFetchClickUpTasks(
  listId: string,
  SearchParams: SearchParams | null
) {
  const [clickUpTasks, setClickUpTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      let allTasks: Task[] = [];
      let page = 0;
      let lastPage = false;
      let fetchFailed = false;

      do {
        // Construcción manual de la query string
        const query = new URLSearchParams();
        query.append("page", page.toString());

        Object.entries(SearchParams as SearchParams).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => query.append(key, item)); // Agregar múltiples valores con la misma clave
          } else {
            query.append(key, value.toString());
          }
        });

        try {
          const response = await fetch(
            `https://api.clickup.com/api/v2/list/${listId}/task?${query.toString()}`,
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

          const data = await response.json();
          allTasks = [...allTasks, ...data.tasks];
          lastPage = data.last_page;
          page += 1;
        } catch (requestError) {
          const normalizedError =
            requestError instanceof Error
              ? requestError
              : new Error("Unknown error fetching ClickUp tasks.");

          console.error("Error fetching tasks:", normalizedError);

          if (isMounted) {
            setError(normalizedError);
          }

          fetchFailed = true;
          lastPage = true;
        }
      } while (!lastPage);

      if (isMounted) {
        setClickUpTasks(fetchFailed ? [] : allTasks);
        setLoading(false);
      }
    };

    if (SearchParams) {
      fetchTasks();
    } else {
      setClickUpTasks([]);
      setLoading(false);
      setError(null);
    }

    return () => {
      isMounted = false;
    };
  }, [listId, SearchParams]);

  return { clickUpTasks, loading, error };
}
