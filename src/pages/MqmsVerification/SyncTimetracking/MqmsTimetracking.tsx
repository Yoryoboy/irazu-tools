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

const payloads: newTimeEntryPayload[] = [
  {
    clickUpID: "86b3m45c0",
    assignee: 82237767,
    start: 1737571534842,
    stop: 1737574464365,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3m45c0",
    assignee: 82237767,
    start: 1737574477161,
    stop: 1737574482231,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3m45c0",
    assignee: 82237767,
    start: 1737574494052,
    stop: 1737574507499,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3gexbv",
    assignee: 82237767,
    start: 1736858026292,
    stop: 1736859522730,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3gexbv",
    assignee: 82237767,
    start: 1736859536581,
    stop: 1736859651351,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3gexbt",
    assignee: 82237767,
    start: 1736856286357,
    stop: 1736857747418,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3gexbt",
    assignee: 82237767,
    start: 1736857760751,
    stop: 1736857933149,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3gexbt",
    assignee: 82237767,
    start: 1736857945809,
    stop: 1736857946100,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3fg92g",
    assignee: 82237767,
    start: 1736772516388,
    stop: 1736774348513,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3fg92g",
    assignee: 82237767,
    start: 1736774360847,
    stop: 1736774474005,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3fg92g",
    assignee: 82237767,
    start: 1736774497334,
    stop: 1736774502922,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
];

function MqmsTimetracking() {
  // const { filteredTasks } = useCombinedFilteredTasks();
  // const { accessToken } = useMQMSAuth();
  // const { userHierarchy } = useMQMSDesignTeam(accessToken);

  // const taskIsMissingWorkRequestID = checkMissingWorkRequestID(filteredTasks);

  // const tasks = useMemo(() => {
  //   return filteredTasks.length > 0
  //     ? filteredTasks.map((task) => extractTaskFields(task, fields))
  //     : [];
  // }, [filteredTasks]);

  // const UuidList = useMemo(() => {
  //   return !taskIsMissingWorkRequestID
  //     ? tasks.map((task) => task["WORK REQUEST ID"] as string)
  //     : [];
  // }, [tasks, taskIsMissingWorkRequestID]);

  // const idsList =
  //   tasks.length > 0 ? tasks.map((task) => task.id as string) : [];

  // const { MQMSTasksTimetracker } = useMQMSTimetracker(
  //   accessToken,
  //   UuidList,
  //   userHierarchy
  // );

  // const MQMSTaskTimetrackerWithID = getMQMSTaskTimetrackerWithID(
  //   MQMSTasksTimetracker,
  //   tasks,
  //   filteredTasks
  // );

  // const { payloads } = useTimetrackingPayloads(
  //   idsList,
  //   MQMSTaskTimetrackerWithID
  // );

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
