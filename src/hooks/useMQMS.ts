import { useEffect, useState } from "react";
import { MQMSFetchTasksResponse } from "../types/MQMS";
import { fetchMQMSTasks } from "../utils/MQMSApi";

export function useMQMSFetchTasks(
  accessToken: string | null,
  listOfSentTasks: string[] = []
) {
  const [MQMSTasks, setMQMSTasks] = useState<MQMSFetchTasksResponse[]>([]);

  useEffect(() => {
    if (!accessToken || listOfSentTasks.length === 0) {
      return;
    }

    async function fetchTasks() {
      const body = JSON.stringify({
        archiveBucket: "live",
        externalID: listOfSentTasks,
      });
      const url =
        "https://mqms.corp.chartercom.com/api/work-requests/search?srcTimezone=America/Buenos_Aires";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorizations: `Bearer ${accessToken}`,
      };

      if (listOfSentTasks.length <= 30) {
        const data = await fetchMQMSTasks(headers, url, body);
        setMQMSTasks(data);
        return;
      }
    }
  }, [accessToken, listOfSentTasks]);

  return { MQMSTasks };
}
