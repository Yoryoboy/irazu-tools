import { useMemo } from "react";
import { useMQMSFetchTasks } from "../../../hooks/useMQMS";
import ComparisonTable from "./ComparisonTable";
import { extractTaskFields } from "../../../utils/helperFunctions";
import { Task } from "../../../types/Task";

interface Props {
  accessToken: string | undefined;
  clickUpTasks: Task[];
}

const FIELDS = [
  "id",
  "name",
  "SECONDARY ID",
  "status",
  "assignees",
  "WORK REQUEST ID",
];

// const LISTSENTTASK = [
//   "5227be92-e8b0-4c5d-8699-5fd3dbfae5b6",
//   "5227be29-e8b0-4c5d-8699-5fb3dbfae5b7",
//   "f7acf842-9274-45bc-bb7e-13d7fdd59f6d",
// ];

function MqmsCheckApprovedTasks({ accessToken, clickUpTasks }: Props) {
  const sentTasks = useMemo(() => {
    return clickUpTasks.map((task) => {
      const taskFields = extractTaskFields(task, FIELDS);
      return {
        ...taskFields,
      };
    });
  }, [clickUpTasks]);

  const listOfSentTasks = useMemo(() => {
    return sentTasks
      .map((task) => {
        if (task["WORK REQUEST ID"] === "") {
          console.log(`NO WORK REQUEST ID FOUND FOR TASK: ${task.name}`);
        }
        return task["WORK REQUEST ID"] as string;
      })
      .filter((task) => {
        return task !== "";
      });
  }, [sentTasks]);

  const { MQMSTasks, MQMSTasksRejected, isLoading } = useMQMSFetchTasks(
    accessToken,
    listOfSentTasks
  );

  console.log("MQMSTasksRejected: ", MQMSTasksRejected);

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
