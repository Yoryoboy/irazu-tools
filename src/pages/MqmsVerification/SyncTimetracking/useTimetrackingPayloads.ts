import useBulkTasksTimeStatus from "../../../hooks/useBulkTasksTimeStatus";
import { TaskTimeDataWithClickUpID } from "../../../types/MQMS";
import { newTimeEntryPayload } from "../../../types/Task";
import { getTimetrackingPayloadForTask } from "../../../utils/helperFunctions";
import { getTimeSpentInStatusPayloads } from "../../../utils/tasksFunctions";

const validStatuses = [
  "asbuilt in qc by irazu",
  "design in qc by irazu",
  "redesign in qc by irazu",
  "ready for qc",
];

export function useTimetrackingPayloads(
  idsList: string[],
  MQMSTaskTimetrackerWithID: TaskTimeDataWithClickUpID[]
) {
  const { timeStatus } = useBulkTasksTimeStatus(idsList);

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

  const payloads =
    payloadsWithMQMSTime && TimeSpentInStatusPayloads
      ? [...payloadsWithMQMSTime, ...TimeSpentInStatusPayloads]
      : [];

  return { payloads };
}
