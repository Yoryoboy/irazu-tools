import { useEffect, useState } from "react";
import { CLICKUP_API_AKEY } from "../utils/config";
import { FecthBulkTasksTimeStatusResponse } from "../types/Task";

function useBulkTasksTimeStatus(idsList: string[]) {
  const [tasksTimeTimeStatus, setTasksTimeTimeStatus] =
    useState<FecthBulkTasksTimeStatusResponse | null>(null);

  let idsQueryString: string = "";

  idsList.forEach((id) => {
    idsQueryString += "task_ids=" + id + "&";
  });

  useEffect(() => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: CLICKUP_API_AKEY,
      },
    };

    async function fecthBulkTasksTimeStatus() {
      const response = await fetch(
        `https://api.clickup.com/api/v2/task/bulk_time_in_status/task_ids?${idsQueryString}`,
        options
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
      }

      const data: FecthBulkTasksTimeStatusResponse = await response.json();
      return data;
    }

    if (idsQueryString) {
      fecthBulkTasksTimeStatus().then((data) => {
        setTasksTimeTimeStatus(data);
      });
    }
  }, [idsQueryString]);

  const timeStatus = tasksTimeTimeStatus
    ? Object.keys(tasksTimeTimeStatus).map((id) => {
        return {
          task_id: id,
          ...tasksTimeTimeStatus[id],
        };
      })
    : [];

  return { timeStatus };
}

export default useBulkTasksTimeStatus;
