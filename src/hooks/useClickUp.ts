import { useEffect, useState } from "react";

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
