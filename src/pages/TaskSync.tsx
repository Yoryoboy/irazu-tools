import { useState } from "react";
import ExcelUploader from "../components/ExcelUploader";
import { MQMSTask } from "../types.d";
import TasksTable from "../components/TasksTable";
import { useFetchClickUpTasks } from "../hooks/useClickUp";
import { getNewTasksFromMqms } from "../utils/tasksFunctions";
import { CLICKUP_LIST_IDS } from "../constants/clickUpCustomFields";

import styles from "./TaskSync.module.css";
import NewTasksTable from "../components/NewTasksTable";

const LIST_ID = CLICKUP_LIST_IDS.cciBau;

function TaskSync() {
  const [MQMSTasks, setMQMSTasks] = useState<MQMSTask[]>([]);
  const { clickUpTasks } = useFetchClickUpTasks(LIST_ID);

  const newMqmsTasks =
    MQMSTasks.length > 0 ? getNewTasksFromMqms(MQMSTasks, clickUpTasks) : [];

  return (
    <main style={styles}>
      <ExcelUploader setData={setMQMSTasks} />
      <TasksTable data={MQMSTasks} />
      {clickUpTasks.length > 0 && newMqmsTasks.length > 0 ? (
        <NewTasksTable
          newMqmsTasks={newMqmsTasks}
          setMQMSTasks={setMQMSTasks}
        />
      ) : null}
      {clickUpTasks.length === 0 && <p>Obteniendo datos de ClickUp...</p>}
    </main>
  );
}

export default TaskSync;
