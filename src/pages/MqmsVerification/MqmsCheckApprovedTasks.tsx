import { useMemo } from "react";
import { useMQMSFetchTasks } from "../../hooks/useMQMS";
import ComparisonTable from "./ComparisonTable";
import { extractTaskFields } from "../../utils/helperFunctions";
import { Task } from "../../types/Task";

interface Props {
  accessToken: string | undefined;
  clickUpTasks: Task[];
}

function MqmsCheckApprovedTasks({ accessToken, clickUpTasks }: Props) {
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
