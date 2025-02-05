import { useMQMSAuth } from "../../hooks/useMQMSAuth";
import { useMQMSDesignTeam } from "../../hooks/useMQMSDesignTeam";
import { useMQMSTimetracker } from "../../hooks/useMQMSTimetracker";
import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import {
  extractTaskFields,
  getTimetrackingPayloadForTask,
  sendBatchedRequests,
} from "../../utils/helperFunctions";
import { TaskTimeDataWithClickUpID } from "../../types/MQMS";
import { createNewtimeEntry } from "../../utils/clickUpApi";
import {
  CreateNewTimeEntryResponse,
  newTimeEntryPayload,
} from "../../types/Task";
import {
  BAU_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS,
  HS_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS,
} from "./MqmsTimetracking.SearchParams";
import useBulkTasksTimeStatus from "../../hooks/useBulkTasksTimeStatus";
import { getTimeSpentInStatusPayloads } from "../../utils/tasksFunctions";
import { useMemo } from "react";

const fields = ["id", "WORK REQUEST ID", "assignees"];
const validStatuses = [
  "asbuilt in qc by irazu",
  "design in qc by irazu",
  "redesign in qc by irazu",
  "ready for qc",
];

function MqmsTimetracking() {
  const { filteredTasks: hsFilteredTasks } = useFilteredTasks(
    HS_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS
  );
  const { filteredTasks: bauFilteredTasks } = useFilteredTasks(
    BAU_APPROVED_TIME_NOT_TRACKED_SEARCH_PARAMS
  );
  const { accessToken } = useMQMSAuth();
  const { userHierarchy } = useMQMSDesignTeam(accessToken);

  const filteredTasks = useMemo(() => {
    return [...hsFilteredTasks, ...bauFilteredTasks];
  }, [bauFilteredTasks, hsFilteredTasks]);

  const taskIsMissingWorkRequestID =
    filteredTasks.length > 0
      ? filteredTasks.some((task) => {
          const workRequestID = task?.custom_fields?.find(
            (field) => field.name === "WORK REQUEST ID"
          );

          if (!workRequestID?.value) {
            console.log(`Missing Work Request ID for task ${task.name}`);
          }

          return !workRequestID?.value;
        })
      : true;

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
