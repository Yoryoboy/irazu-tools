import { useEffect, useState } from "react";
import { TaskDatum } from "../types/MQMS";
import { fetchMQMSTaskByUuid } from "../utils/MQMSApi";

const BASE_URL = "https://mqms.corp.chartercom.com/api/work-requests/";

export function useMQMSFetchTasks(
  accessToken: string | null | undefined,
  listOfSentTasks: string[] = []
) {
  const [MQMSTasks, setMQMSTasks] = useState<TaskDatum[]>([]);
  const [MQMSTasksRejected, setMQMSTasksRejected] = useState<
    { status: string; uuid: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      if (!accessToken || listOfSentTasks.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorizations: accessToken,
      };

      try {
        const allResults = await Promise.allSettled(
          listOfSentTasks.map(async (uuid) => {
            const url = `${BASE_URL}${uuid}`;
            const { status, data } = await fetchMQMSTaskByUuid(headers, url);
            if (status !== "success" || !data) {
              throw new Error("status is not 'success' or data is not defined");
            }

            if (data.length === 0) {
              return {
                status: "UUID_NOT_FOUND",
                uuuid: uuid,
              };
            }
            return data;
          })
        );

        const fulfilledResults: TaskDatum[][] = [];
        const rejectedResults: { status: string; uuid: string }[] = [];

        allResults.forEach((result) => {
          if (result.value.status !== "UUID_NOT_FOUND") {
            fulfilledResults.push(result.value);
          } else {
            rejectedResults.push(result.value);
          }
        });

        setMQMSTasks(fulfilledResults.flat());
        setMQMSTasksRejected(rejectedResults.flat());
      } catch (error) {
        console.error("Error fetching MQMS tasks:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, [accessToken, listOfSentTasks]);

  return { MQMSTasks, MQMSTasksRejected, isLoading };
}
