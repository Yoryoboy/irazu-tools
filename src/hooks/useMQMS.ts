import { useEffect, useState } from "react";
import { Result } from "../types/MQMS";
import { fetchMQMSTasks } from "../utils/MQMSApi";
import { splitTaskArray } from "../utils/helperFunctions";

export function useMQMSFetchTasks(
  accessToken: string | null | undefined,
  listOfSentTasks: string[] = []
) {
  const [MQMSTasks, setMQMSTasks] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      if (!accessToken || listOfSentTasks.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const partialBody = { archiveBucket: "live" };
      const url =
        "https://mqms.corp.chartercom.com/api/work-requests/search?srcTimezone=America/Buenos_Aires";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorizations: accessToken,
      };

      try {
        if (listOfSentTasks.length <= 30) {
          const body = JSON.stringify({
            ...partialBody,
            externalID: listOfSentTasks.join(),
          });
          const { status, data } = await fetchMQMSTasks(headers, url, body);

          if (status !== "success" || !data?.results) {
            throw new Error("status is not 'success' or data is not defined");
          }

          setMQMSTasks(data.results);
        } else {
          const chunkedTasks = splitTaskArray(listOfSentTasks, 30);
          const allResults = await Promise.all(
            chunkedTasks.map(async (chunk) => {
              const body = JSON.stringify({
                ...partialBody,
                externalID: chunk.join(),
              });
              const { status, data } = await fetchMQMSTasks(headers, url, body);
              if (status !== "success" || !data?.results) {
                throw new Error(
                  "status is not 'success' or data is not defined"
                );
              }
              return data.results;
            })
          );
          setMQMSTasks(allResults.flat());
        }
      } catch (error) {
        console.error("Error fetching MQMS tasks:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, [accessToken, listOfSentTasks]);

  return { MQMSTasks, isLoading };
}
