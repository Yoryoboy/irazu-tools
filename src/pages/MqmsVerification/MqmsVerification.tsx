import { useMemo } from "react";
import { CLICKUP_LIST_IDS } from "../../constants/clickUpCustomFields";
import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { SearchParams } from "../../types/SearchParams";
import { splitTaskArray } from "../../utils/helperFunctions";
import { useMQMS } from "../../hooks/useMQMS";

function MqmsVerification() {
  const searchParams: SearchParams = useMemo(() => {
    return {
      "statuses[]": ["sent"],
    };
  }, []);

  const { clickUpTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciBau,
    searchParams
  );

  const { MQMSUser } = useMQMS();

  console.log(MQMSUser);

  const listOfSentTasks = clickUpTasks.map((task) => task.name);

  const listOfSentTasksChunks = useMemo(
    () => splitTaskArray(listOfSentTasks, 30),
    [listOfSentTasks]
  );

  console.log(listOfSentTasksChunks);

  console.log(clickUpTasks.length);
  return <div></div>;
}

export default MqmsVerification;
