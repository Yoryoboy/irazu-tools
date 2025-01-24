import { useMQMSAuth } from "../../hooks/useMQMSAuth";
import { useMQMSDesignTeam } from "../../hooks/useMQMSDesignTeam";
import { useMQMSTimetracker } from "../../hooks/useMQMSTimetracker";
import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import { CLICKUP_LIST_IDS } from "../../utils/config";
import {
  extractTaskFields,
  getTimetrackingPayloadForTask,
} from "../../utils/helperFunctions";
import { useMemo } from "react";
import { TaskTimeDataWithClickUpID } from "../../types/MQMS";
import { createNewtimeEntry } from "../../utils/clickUpApi";

const { cciHs, cciBau } = CLICKUP_LIST_IDS;

const DEFAULT_SEARCH_PARAMS = {
  page: "0",
  "list_ids[]": cciBau,
  include_closed: "true",
  "assignees[]": "82212594",
  "statuses[]": ["approved"],
  custom_fields: JSON.stringify([
    // {
    //   field_id: "ed83fc7c-baeb-4fdc-8e59-7ccbb4587cd5",
    //   operator: "RANGE",
    //   value: [new Date("1/1/2025").getTime(), new Date("1/31/2025").getTime()],
    // },
    // {
    //   field_id: "618dff50-c93b-4914-9bb3-4c2ec84a91f1",
    //   operator: "IS NULL",
    // },
  ]),
};

const fields = ["id", "WORK REQUEST ID"];

function MqmsTimetracking() {
  const { filteredTasks } = useFilteredTasks(DEFAULT_SEARCH_PARAMS);
  const { accessToken } = useMQMSAuth();
  const { userHierarchy } = useMQMSDesignTeam(accessToken);

  const tasks = useMemo(() => {
    return filteredTasks
      .filter((task) => !task.time_spent)
      .map((task) => extractTaskFields(task, fields));
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
    });

  if (MQMSTaskTimetrackerWithID.length > 0) {
    console.log("MQMSTaskTimetrackerWithID :", MQMSTaskTimetrackerWithID);
  }
  const payloads: {
    clickUpID: string;
    start: number;
    stop: number;
  }[] = MQMSTaskTimetrackerWithID.slice(0, 20)
    .map((task) => getTimetrackingPayloadForTask(task))
    .flat();

  if (payloads.length > 0) {
    console.log("payloads", payloads);
  }
  function handleClick() {
    payloads.forEach((payload) => {
      createNewtimeEntry(payload);
    });
  }

  return (
    <div>
      <button onClick={handleClick}>Create new time entry</button>
    </div>
  );
}

export default MqmsTimetracking;
