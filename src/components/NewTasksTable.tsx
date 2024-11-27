import TasksTable from "./TasksTable";
import { MQMSTask, Task, FulfilledPostNewTaskResult } from "../types.d";
import { postNewTasks, getNewTask } from "../utils/tasksFunctions";
import { CLICKUP_LIST_IDS } from "../constants/clickUpCustomFields";

const apikey = import.meta.env.VITE_CLICKUP_API_AKEY;

interface Props {
  newMqmsTasks: MQMSTask[];
  setMQMSTasks: (tasks: MQMSTask[]) => void;
}

function updateNewMqmsTasks(newTaskName: string, newMqmsTasks: MQMSTask[]) {
  return newMqmsTasks.filter((task) => task.EXTERNAL_ID !== newTaskName);
}

function NewTasksTable({ newMqmsTasks, setMQMSTasks }: Props) {
  const handleAction = async (row: MQMSTask) => {
    const newTask: Task[] = [];
    newTask.push(getNewTask(row));

    const results = await postNewTasks(
      newTask,
      CLICKUP_LIST_IDS.cciBau,
      apikey
    );

    const failedTasks = results.filter(
      (result) => result.status === "rejected"
    );
    if (failedTasks.length > 0) {
      console.error("Error procesando tareas:", failedTasks);
    }

    const successfulTasks = results.filter(
      (result) => result.status === "fulfilled"
    );
    if (successfulTasks.length > 0) {
      console.log("Tareas procesadas:", successfulTasks);
      setMQMSTasks(
        updateNewMqmsTasks(successfulTasks[0].value.taskName, newMqmsTasks)
      );
    }
  };

  const handleSyncAll = async () => {
    const allNewTasks = newMqmsTasks.map((row) => getNewTask(row));

    const results = await postNewTasks(
      allNewTasks,
      CLICKUP_LIST_IDS.cciBau,
      apikey
    );

    const failedTasks = results.filter(
      (result) => result.status === "rejected"
    );
    if (failedTasks.length > 0) {
      console.error("Error procesando tareas:", failedTasks);
    }

    const successfulTasks = results.filter(
      (result): result is FulfilledPostNewTaskResult =>
        result.status === "fulfilled"
    );
    if (successfulTasks.length > 0) {
      console.log("Tareas procesadas:", successfulTasks);

      const updatedTasks = newMqmsTasks.filter(
        (task) =>
          !successfulTasks.some(
            (success) => success.value.taskName === task.EXTERNAL_ID
          )
      );

      setMQMSTasks(updatedTasks);
    }
  };

  return (
    <div>
      <TasksTable
        data={newMqmsTasks}
        renderAdditionalColumns={(row) => (
          <button onClick={() => handleAction(row)}>Action</button>
        )}
      />
      <button onClick={handleSyncAll}>Sincronizar todas las tareas</button>
    </div>
  );
}

export default NewTasksTable;
