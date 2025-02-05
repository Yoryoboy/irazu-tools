import { useMQMSAuth } from "../../../hooks/useMQMSAuth";
import { useMQMSDesignTeam } from "../../../hooks/useMQMSDesignTeam";
import { useMQMSTimetracker } from "../../../hooks/useMQMSTimetracker";
import {
  extractTaskFields,
  sendBatchedRequests,
} from "../../../utils/helperFunctions";
import { createNewtimeEntry } from "../../../utils/clickUpApi";
import {
  CreateNewTimeEntryResponse,
  newTimeEntryPayload,
} from "../../../types/Task";

import {
  checkMissingWorkRequestID,
  getMQMSTaskTimetrackerWithID,
} from "../../../utils/tasksFunctions";
import { useMemo } from "react";
import { useCombinedFilteredTasks } from "./useCombinedFilteredTasks";
import { useTimetrackingPayloads } from "./useTimetrackingPayloads";

const fields = ["id", "WORK REQUEST ID", "assignees"];

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

  const { payloads } = useTimetrackingPayloads(
    idsList,
    MQMSTaskTimetrackerWithID
  );

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
