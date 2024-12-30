import { useMemo } from "react";
import { CLICKUP_LIST_IDS } from "../../constants/clickUpCustomFields";
import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { SearchParams } from "../../types/SearchParams";
import useMQMSAuth from "../../hooks/useMQMSAuth";
import { useMQMSFetchTasks } from "../../hooks/useMQMS";
import ComparisonTable from "./ComparisonTable";
import { extractTaskFields } from "../../utils/helperFunctions";

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

  const sentTasks = clickUpTasks.map((task) => {
    const taskFields = extractTaskFields(task, ["name", "SECONDARY ID"]);
    return {
      ...taskFields,
    };
  });

  return (
    <main>
      <h1>Verificación de tareas enviadas</h1>
      <ComparisonTable MQMSTasks={MQMSTasks} sentTasks={sentTasks} />
    </main>
  );
}

export default MqmsVerification;
