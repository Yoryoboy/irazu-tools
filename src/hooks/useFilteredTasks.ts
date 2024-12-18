import { useEffect, useState } from "react";
import { fetchFilteredTasks } from "../utils/tasksFunctions";
import { CLICKUP_API_AKEY, TEAM_ID } from "../utils/config";
import { SearchParams } from "../types/SearchParams";
import { Task } from "../types/Task";

export function useFilteredTasks(initialSearchParams: SearchParams) {
  const [searchParams, setSearchParams] =
    useState<SearchParams>(initialSearchParams);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchFilteredTasks(TEAM_ID, searchParams, CLICKUP_API_AKEY)
      .then((tasks) => {
        setFilteredTasks(tasks);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setError(error);
        setLoading(false);
      });
  }, [searchParams]);

  return {
    filteredTasks,
    loading,
    error,
    setSearchParams,
  };
}
