import { useEffect, useState } from "react";
import { TaskDatum } from "../types/MQMS";
import { fetchMQMSTaskByUuid } from "../utils/MQMSApi";

const BASE_URL = "https://mqms.corp.chartercom.com/api/work-requests/";

interface PromiseFulfilledResult<T> {
  status: "fulfilled";
  value: T;
}

interface PromiseRejectedResult {
  status: "rejected";
  reason: unknown;
}

type PromiseSettledResult<T> =
  | PromiseFulfilledResult<T>
  | PromiseRejectedResult;

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
        const allResults: PromiseSettledResult<TaskDatum[]>[] =
          await Promise.allSettled(
            listOfSentTasks.map(async (uuid) => {
              const url = `${BASE_URL}${uuid}`;
              const { status, data } = await fetchMQMSTaskByUuid(headers, url);
              if (status !== "success" || !data || data.length === 0) {
                return Promise.reject({ status: "UUID_NOT_FOUND", uuid: uuid });
              }
              return Promise.resolve(data);
            })
          );

        const fulfilledResults: TaskDatum[][] = [];
        const rejectedResults: { status: string; uuid: string }[] = [];

        allResults.forEach((result) => {
          if (result.status === "fulfilled") {
            if (Array.isArray(result.value)) {
              fulfilledResults.push(result.value);
            }
          } else {
            if (
              typeof result.reason === "object" &&
              result.reason !== null &&
              "status" in result.reason &&
              "uuid" in result.reason
            ) {
              rejectedResults.push(
                result.reason as { status: string; uuid: string }
              );
            }
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
