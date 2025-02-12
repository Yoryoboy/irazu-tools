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
import TimetrackingTable from "./TimetrackingTable";

const fields = [
  "id",
  "WORK REQUEST ID",
  "assignees",
  "QC PERFORMED BY",
  "PREASBUILT QC BY",
  "DESIGN QC BY",
  "REDESIGN QC BY",
];

const payloads: newTimeEntryPayload[] = [
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738348789486,
    stop: 1738354752275,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738586403589,
    stop: 1738620265150,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738670856491,
    stop: 1738688703227,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738772250692,
    stop: 1738772296891,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738854283947,
    stop: 1738866863613,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738869563191,
    stop: 1738872517700,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738872525306,
    stop: 1738872539237,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738872551270,
    stop: 1738872586009,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738928907665,
    stop: 1738949429113,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738949486610,
    stop: 1738953194144,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738953205054,
    stop: 1738953354876,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1738953534918,
    stop: 1738954330045,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1739208507349,
    stop: 1739208522950,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    assignee: 49692417,
    start: 1739208530515,
    stop: 1739208536352,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738609592517,
    stop: 1738669439536,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738669624124,
    stop: 1738669629300,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738669643051,
    stop: 1738669883171,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738776077923,
    stop: 1738776141936,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738889797299,
    stop: 1738889816970,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738889824722,
    stop: 1738891852798,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738891860631,
    stop: 1738891919703,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738960103034,
    stop: 1738960125707,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738969338927,
    stop: 1738969344582,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738969351543,
    stop: 1738969356849,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738971288068,
    stop: 1738971292927,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738971300420,
    stop: 1738971304028,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    assignee: 43076422,
    start: 1738971741990,
    stop: 1738971747465,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3vhgj2",
    assignee: 61482821,
    start: 1738952563200,
    stop: 1738953327118,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3vhgj2",
    assignee: 61482821,
    start: 1738953328162,
    stop: 1738953340894,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3vhgj2",
    assignee: 61482821,
    start: 1738953348085,
    stop: 1738954297795,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3vhgj2",
    assignee: 61482821,
    start: 1738954302281,
    stop: 1738954309845,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3vhgj2",
    assignee: 61482821,
    start: 1738954320214,
    stop: 1738954444032,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1738157675071,
    stop: 1738174451118,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1738174455108,
    stop: 1738174484349,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1738174492011,
    stop: 1738174536367,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1738174543827,
    stop: 1738174589473,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1738174602363,
    stop: 1738174614910,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1738176036672,
    stop: 1738176049993,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1738843840406,
    stop: 1738853156732,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1738853173822,
    stop: 1738853183095,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1738853208069,
    stop: 1738853214831,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1739206715108,
    stop: 1739208707614,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1739212493076,
    stop: 1739216520258,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1739216527548,
    stop: 1739216531873,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1739216539060,
    stop: 1739216542438,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1739272906706,
    stop: 1739274756866,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3qe5p8",
    assignee: 49692417,
    start: 1739274762554,
    stop: 1739274766016,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1738174856610,
    stop: 1738175868407,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1738175876049,
    stop: 1738175925596,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1738175933337,
    stop: 1738175986025,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1738175993296,
    stop: 1738175998553,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1738853954371,
    stop: 1738853969853,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1738853975930,
    stop: 1738853981335,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1738853988506,
    stop: 1738853992445,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1739216759012,
    stop: 1739216876597,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1739216882548,
    stop: 1739216889151,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1739216895908,
    stop: 1739216900728,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1739274773811,
    stop: 1739274783931,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5cc",
    assignee: 49692417,
    start: 1739274789897,
    stop: 1739274794587,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5c8",
    assignee: 61482821,
    start: 1738079074618,
    stop: 1738079146664,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5c8",
    assignee: 61482821,
    start: 1738079169336,
    stop: 1738079232859,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3mw5c8",
    assignee: 61482821,
    start: 1738079240430,
    stop: 1738079246553,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b36t9re",
    assignee: 61482821,
    start: 1736943340774,
    stop: 1736943449032,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b36t9re",
    assignee: 61482821,
    start: 1738074614434,
    stop: 1738075231509,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b36t9re",
    assignee: 61482821,
    start: 1738077228022,
    stop: 1738077752499,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b36t9re",
    assignee: 61482821,
    start: 1738078053181,
    stop: 1738078099106,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b36t9re",
    assignee: 61482821,
    start: 1738078150922,
    stop: 1738078156610,
    tags: [
      {
        name: "mqms time",
        tag_bg: "#6E56CF",
        tag_fg: "#6E56CF",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    start: 1738784846496,
    duration: 16980000,
    status: "asbuilt in qc by irazu",
    assignee: 82218659,
    tags: [
      {
        name: "qc time",
        tag_bg: "#e93d82",
        tag_fg: "#e93d82",
      },
    ],
  },
  {
    clickUpID: "86b3hh64p",
    start: 1738969510416,
    duration: 19380000,
    status: "design in qc by irazu",
    assignee: 82218659,
    tags: [
      {
        name: "qc time",
        tag_bg: "#e93d82",
        tag_fg: "#e93d82",
      },
    ],
  },
  {
    clickUpID: "86b3rmbyb",
    start: 1738866943427,
    duration: 17040000,
    status: "asbuilt in qc by irazu",
    assignee: 82206059,
    tags: [
      {
        name: "qc time",
        tag_bg: "#e93d82",
        tag_fg: "#e93d82",
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

  // if (tasks.length > 0) {
  //   console.log("tasks", tasks);
  // }

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
  //   MQMSTaskTimetrackerWithID,
  //   tasks
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
      <TimetrackingTable payloads={payloads} />
      <button onClick={handleClick}>Create new time entry</button>
    </div>
  );
}

export default MqmsTimetracking;
