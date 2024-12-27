import { useMemo } from "react";
import { CLICKUP_LIST_IDS } from "../../constants/clickUpCustomFields";
import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { SearchParams } from "../../types/SearchParams";
import { splitTaskArray } from "../../utils/helperFunctions";
import { useMQMS } from "../../hooks/useMQMS";
import useMQMSAuth from "../../hooks/useMQMSAuth";

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

  const { MQMSUser } = useMQMSAuth();

  const listOfSentTasks = clickUpTasks.map((task) => task.name);

  return <div></div>;
}

export default MqmsVerification;
