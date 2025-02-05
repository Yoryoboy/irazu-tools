import { useMQMSAuth } from "../../../hooks/useMQMSAuth";
import { useMQMSDesignTeam } from "../../../hooks/useMQMSDesignTeam";
import { useMQMSTimetracker } from "../../../hooks/useMQMSTimetracker";
import {
  extractTaskFields,
  getTimetrackingPayloadForTask,
  sendBatchedRequests,
} from "../../../utils/helperFunctions";
import { createNewtimeEntry } from "../../../utils/clickUpApi";
import {
  CreateNewTimeEntryResponse,
  newTimeEntryPayload,
} from "../../../types/Task";

import useBulkTasksTimeStatus from "../../../hooks/useBulkTasksTimeStatus";
import {
  checkMissingWorkRequestID,
  getMQMSTaskTimetrackerWithID,
  getTimeSpentInStatusPayloads,
} from "../../../utils/tasksFunctions";
import { useMemo } from "react";
import { useCombinedFilteredTasks } from "./useCombinedFilteredTasks";

const fields = ["id", "WORK REQUEST ID", "assignees"];
const validStatuses = [
  "asbuilt in qc by irazu",
  "design in qc by irazu",
  "redesign in qc by irazu",
  "ready for qc",
];

function MqmsTimetracking() {
  const { filteredTasks } = useCombinedFilteredTasks();
  const { accessToken } = useMQMSAuth();
  const { userHierarchy } = useMQMSDesignTeam(accessToken);

  const taskIsMissingWorkRequestID = checkMissingWorkRequestID(filteredTasks);

  const tasks = useMemo(() => {
    return filteredTasks.length > 0
      ? filteredTasks.map((task) => extractTaskFields(task, fields))
      : [];
  }, [filteredTasks]);

  const UuidList = useMemo(() => {
    return !taskIsMissingWorkRequestID
      ? tasks.map((task) => task["WORK REQUEST ID"] as string)
      : [];
  }, [tasks, taskIsMissingWorkRequestID]);

  const idsList =
    tasks.length > 0 ? tasks.map((task) => task.id as string) : [];

  const { timeStatus } = useBulkTasksTimeStatus(idsList);

  const { MQMSTasksTimetracker } = useMQMSTimetracker(
    accessToken,
    UuidList,
    userHierarchy
  );

  const MQMSTaskTimetrackerWithID = getMQMSTaskTimetrackerWithID(
    MQMSTasksTimetracker,
    tasks,
    filteredTasks
  );

  const payloadsWithMQMSTime: newTimeEntryPayload[] =
    MQMSTaskTimetrackerWithID.map((task) =>
      getTimetrackingPayloadForTask(task)
    ).flat();

  const TimeSpentInStatusPayloads =
    timeStatus.length > 0 && payloadsWithMQMSTime.length > 0
      ? getTimeSpentInStatusPayloads(
          validStatuses,
          timeStatus,
          payloadsWithMQMSTime
        )
      : [];

  if (timeStatus.length > 0 && payloadsWithMQMSTime.length > 0) {
    console.log("payloadsWithMQMSTime :", payloadsWithMQMSTime);
    console.log("timeStatus :", timeStatus);
  }

  if (TimeSpentInStatusPayloads.length > 0) {
    console.log("TimeSpentInStatusPayloads :", TimeSpentInStatusPayloads);
  }

  const payloads =
    payloadsWithMQMSTime && TimeSpentInStatusPayloads
      ? [...payloadsWithMQMSTime, ...TimeSpentInStatusPayloads]
      : [];

  if (payloads.length > 0) {
    console.log("payloads :", payloads);
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
