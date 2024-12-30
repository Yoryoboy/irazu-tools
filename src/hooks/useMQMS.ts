import { useEffect, useState } from "react";
import { Result } from "../types/MQMS";
import { fetchMQMSTasks } from "../utils/MQMSApi";
import { splitTaskArray } from "../utils/helperFunctions";

export function useMQMSFetchTasks(
  accessToken: string | null | undefined,
  listOfSentTasks: string[] = []
) {
  const [MQMSTasks, setMQMSTasks] = useState<Result[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      if (!accessToken || listOfSentTasks.length === 0) {
        return;
      }

      const partialBody = { archiveBucket: "live" };
      const url =
        "https://mqms.corp.chartercom.com/api/work-requests/search?srcTimezone=America/Buenos_Aires";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorizations: accessToken,
      };

      if (listOfSentTasks.length <= 30) {
        const body = JSON.stringify({
          ...partialBody,
          externalID: listOfSentTasks,
        });
        const data = await fetchMQMSTasks(headers, url, body);
        setMQMSTasks(data.data.results);
        return;
      }

      const chunkedTasks = splitTaskArray(listOfSentTasks, 30);
      chunkedTasks.forEach(async (chunk) => {
        const body = JSON.stringify({
          ...partialBody,
          externalID: chunk.join(),
        });
        const data = await fetchMQMSTasks(headers, url, body);
        setMQMSTasks((prev) => [...prev, ...data.data.results]);
      });
    }
    fetchTasks();
  }, [accessToken, listOfSentTasks]);

  return { MQMSTasks };
}
