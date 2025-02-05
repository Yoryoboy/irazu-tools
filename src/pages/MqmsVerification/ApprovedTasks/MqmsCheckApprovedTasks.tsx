import { useMemo } from "react";
import { CLICKUP_LIST_IDS } from "../../../utils/config";
import { useFetchClickUpTasks } from "../../../hooks/useClickUp";
import { SearchParams } from "../../../types/SearchParams";
import { useMQMSAuth } from "../../../hooks/useMQMSAuth";
import { useMQMSFetchTasks } from "../../../hooks/useMQMS";
import { extractTaskFields } from "../../../utils/helperFunctions";
import ComparisonTable from "./ComparisonTable";

const searchParams: SearchParams = {
  "statuses[]": ["sent"],
};

function MqmsCheckApprovedTasks() {
  const { accessToken } = useMQMSAuth();

  const { clickUpTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciBau,
    searchParams
  );
  const listOfSentTasks = useMemo(() => {
    return clickUpTasks.map((task) => task.name);
  }, [clickUpTasks]);

  const { MQMSTasks, isLoading } = useMQMSFetchTasks(
    accessToken,
    listOfSentTasks
  );

  const sentTasks = clickUpTasks.map((task) => {
    const taskFields = extractTaskFields(task, [
      "id",
      "name",
      "SECONDARY ID",
      "status",
      "assignees",
    ]);
    return {
      ...taskFields,
    };
  });
  return (
    <main>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <h1>Verificación de tareas enviadas</h1>
          <ComparisonTable MQMSTasks={MQMSTasks} sentTasks={sentTasks} />
        </>
      )}
    </main>
  );
}

export default MqmsCheckApprovedTasks;
