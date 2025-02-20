import { useMemo } from "react";
import { useFilteredTasks } from "../../../hooks/useFilteredTasks";
import {
  BAU_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS,
  HS_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS,
} from "./MqmsTimetracking.SearchParams";

export function useCombinedFilteredTasks() {
  const { filteredTasks: hsFilteredTasks } = useFilteredTasks(
    HS_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS
  );
  const { filteredTasks: bauFilteredTasks } = useFilteredTasks(
    BAU_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS
  );

  const filteredTasks = useMemo(() => {
    return [...hsFilteredTasks, ...bauFilteredTasks];
  }, [bauFilteredTasks, hsFilteredTasks]);

  return { filteredTasks };
}
