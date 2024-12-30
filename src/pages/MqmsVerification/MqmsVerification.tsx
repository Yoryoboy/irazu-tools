import { useMemo } from "react";
import { CLICKUP_LIST_IDS } from "../../constants/clickUpCustomFields";
import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { SearchParams } from "../../types/SearchParams";
import useMQMSAuth from "../../hooks/useMQMSAuth";
import { useMQMSFetchTasks } from "../../hooks/useMQMS";

const searchParams: SearchParams = {
  "statuses[]": ["sent"],
};

function MqmsVerification() {
  const { accessToken } = useMQMSAuth();

  const { clickUpTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciBau,
    searchParams
  );
  const listOfSentTasks = useMemo(() => {
    return clickUpTasks.map((task) => task.name);
  }, [clickUpTasks]);

  const { MQMSTasks } = useMQMSFetchTasks(accessToken, listOfSentTasks);

  console.log(MQMSTasks);

  return <div></div>;
}

export default MqmsVerification;
