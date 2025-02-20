import { useEffect, useState } from "react";
import {
  FetchStartsStopsResponse,
  StartsStops,
  TaskTimeData,
  UserHierarchy,
} from "../types/MQMS";

function filterStartsStops(
  startsStops: StartsStops[],
  designTeam: UserHierarchy[]
) {
  return startsStops.filter((startsStops) => {
    return designTeam.find((user) => user.EMP_ID === startsStops.userUUID);
  });
}

export function useMQMSTimetracker(
  accessToken: string | undefined,
  tasksUuidList: string[],
  designTeam: UserHierarchy[]
) {
  const [MQMSTasksTimetracker, setMQMSTasksTimetracker] = useState<
    TaskTimeData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTaskTimetracker(taskUuid: string, accessToken: string) {
      const url = `https://mqms.corp.chartercom.com/api/work-requests-start-stops?workRequestUUID=${taskUuid}`;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorizations: accessToken as string,
      };

      try {
        const response = await fetch(url, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch time tracker");
        }

        const responseData: FetchStartsStopsResponse = await response.json();

        const { status, message, data } = responseData;

        if (status !== "success" || data?.length === 0) {
          throw new Error(
            `Failed to fetch MQMS Times for task ${taskUuid}: ${
              message || "Unknown error"
            }`
          );
        }

        const taskTimeData: TaskTimeData = {
          taskUuid,
          data: filterStartsStops(data, designTeam),
        };

        return taskTimeData;
      } catch (error) {
        console.error("Error fetching MQMS user hierarchy:", error);
      }
    }

    async function fetchAllTaskTimetracker() {
      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all(
          tasksUuidList.map((taskUuid) =>
            fetchTaskTimetracker(taskUuid, accessToken as string)
          )
        );

        setMQMSTasksTimetracker(results as TaskTimeData[]);
      } catch (error) {
        setError("Error fetchinh hierarchies");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (accessToken && tasksUuidList.length > 0 && designTeam.length > 0) {
      fetchAllTaskTimetracker();
    }
  }, [designTeam, tasksUuidList, accessToken]);

  return { MQMSTasksTimetracker, loading, error };
}
