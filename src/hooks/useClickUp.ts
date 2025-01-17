import { useEffect, useState } from "react";
import { CLICKUP_API_AKEY } from "../utils/config";
import { Task } from "../types/Task";
import { SearchParams } from "../types/SearchParams";

export function useFetchClickUpTasks(
  listId: string,
  SearchParams: SearchParams
) {
  const [clickUpTasks, setClickUpTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      let allTasks: Task[] = [];
      let page = 0;
      let lastPage = false;

      do {
        const query = new URLSearchParams({
          page: page.toString(),
          ...SearchParams,
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

          const data = await response.json();
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
  }, [listId, SearchParams]);

  return { clickUpTasks };
}
