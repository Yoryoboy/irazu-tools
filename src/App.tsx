import { useState } from "react";
import ExcelUploader from "./components/ExcelUploader";
import { MQMSTask } from "./types.d";
import TasksTable from "./components/TasksTable";
import { useFetchClickUpTasks } from "./hooks/useClickUp";
import { getNewTasksFromMqms } from "./utils/tasksFunctions";

import styles from "./App.module.css";
import NewTasksTable from "./components/NewTasksTable";

const LIST_ID = "901404730264";

function App() {
  const [MQMSTasks, setMQMSTasks] = useState<MQMSTask[]>([]);
  const { clickUpTasks } = useFetchClickUpTasks(LIST_ID);

  const newMqmsTasks =
    MQMSTasks.length > 0 ? getNewTasksFromMqms(MQMSTasks, clickUpTasks) : [];

  return (
    <main style={styles}>
      <ExcelUploader setData={setMQMSTasks} />
      <TasksTable data={MQMSTasks} />
      {clickUpTasks.length > 0 ? (
        <NewTasksTable newMqmsTasks={newMqmsTasks} />
      ) : (
        <p>Obteniendo datos de ClickUp...</p>
      )}
    </main>
  );
}

export default App;
