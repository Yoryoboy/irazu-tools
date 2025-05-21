import useBulkTasksTimeStatus from "../../../hooks/useBulkTasksTimeStatus";
import { TaskTimeDataWithClickUpID } from "../../../types/MQMS";
import {
  ExtractedTaskFieldValues,
  newTimeEntryPayload,
  TimetrackingPayload,
  TimetrackingVerificationPayload,
} from "../../../types/Task";
import { getTimetrackingPayloadForTask } from "../../../utils/helperFunctions";
import { getTimeSpentInStatusPayloads } from "../../../utils/tasksFunctions";




const validStatuses = [
  "asbuilt in qc by irazu",
  "design in qc by irazu",
  "redesign in qc by irazu",
  "internal qc",
];

export function useTimetrackingPayloads(
  idsList: string[],
  MQMSTaskTimetrackerWithID: TaskTimeDataWithClickUpID[],
  extractedTaskFieldValues: ExtractedTaskFieldValues[]
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
          extractedTaskFieldValues
        )
      : [];

  const IdListToCheckTimetracked: string[] = payloadsWithMQMSTime.reduce((acc, curr) => {
    if (!acc.includes(curr.clickUpID)) {
      acc.push(curr.clickUpID);
    }
    
    return acc;
  }, [] as string[])

  const payloadToCheckTimetracked: TimetrackingVerificationPayload[] = IdListToCheckTimetracked.length > 0 ? IdListToCheckTimetracked.map(id => {
    return {
      clickUpID: id,
      timetracked: true
    }
  }) : []

  

  const payloads: TimetrackingPayload[] =
    payloadsWithMQMSTime && TimeSpentInStatusPayloads && payloadToCheckTimetracked
      ? [...payloadsWithMQMSTime, ...TimeSpentInStatusPayloads, ...payloadToCheckTimetracked]
      : [];

  return { payloads };
}
