import { useMQMSAuth } from "../../hooks/useMQMSAuth";
import { useMQMSDesignTeam } from "../../hooks/useMQMSDesignTeam";
import { useMQMSTimetracker } from "../../hooks/useMQMSTimetracker";
import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import {
  extractTaskFields,
  getTimetrackingPayloadForTask,
  sendBatchedRequests,
} from "../../utils/helperFunctions";
import { useMemo } from "react";
import { TaskTimeDataWithClickUpID } from "../../types/MQMS";
import { createNewtimeEntry } from "../../utils/clickUpApi";
import {
  CreateNewTimeEntryResponse,
  newTimeEntryPayload,
} from "../../types/Task";
import { APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS } from "./MqmsTimetracking.SearchParams";

const fields = ["id", "WORK REQUEST ID", "assignees"];

function MqmsTimetracking() {
  const { filteredTasks } = useFilteredTasks(
    APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS
  );
  const { accessToken } = useMQMSAuth();
  const { userHierarchy } = useMQMSDesignTeam(accessToken);

  const tasks = useMemo(() => {
    return filteredTasks.map((task) => extractTaskFields(task, fields));
  }, [filteredTasks]);

  const UuidList: string[] = useMemo(() => {
    return tasks.length > 0
      ? tasks.map((task) => task["WORK REQUEST ID"] as string)
      : [];
  }, [tasks]);

  const { MQMSTasksTimetracker } = useMQMSTimetracker(
    accessToken,
    UuidList,
    userHierarchy
  );

  const MQMSTaskTimetrackerWithID: TaskTimeDataWithClickUpID[] =
    MQMSTasksTimetracker.map((task) => {
      const sentTask = tasks.find(
        (sentTask) => sentTask["WORK REQUEST ID"] === task.taskUuid
      );
      return { ...task, clickUpID: sentTask?.id?.toString() as string };
    }).map((task) => {
      const sentTask = filteredTasks.find(
        (sentTask) => sentTask.id === task.clickUpID
      );
      return { ...task, assignee: sentTask?.assignees?.[0]?.id as number };
    });

  if (MQMSTaskTimetrackerWithID.length > 0) {
    console.log("MQMSTaskTimetrackerWithID :", MQMSTaskTimetrackerWithID);
  }

  const payloads: newTimeEntryPayload[] = MQMSTaskTimetrackerWithID.map(
    (task) => getTimetrackingPayloadForTask(task)
  ).flat();

  if (payloads.length > 0) {
    console.log("payloads", payloads);
  }

  function handleClick() {
    if (payloads.length > 0) {
      console.log(`Starting to send ${payloads.length} payloads...`);

      sendBatchedRequests<newTimeEntryPayload, CreateNewTimeEntryResponse>(
        payloads,
        90,
        createNewtimeEntry
      ).catch((error) => {
        console.error("Error sending batched requests:", error);
      });
    } else {
      console.log("No payloads to send.");
    }
  }

  return (
    <div>
      <button onClick={handleClick}>Create new time entry</button>
    </div>
  );
}

export default MqmsTimetracking;
