import { useState } from "react";
import ExcelUploader from "../../components/ExcelUploader";
import { fetchTasks } from "../../hooks/useClickUp";
import { getNewTasksFromMqms } from "../../utils/tasksFunctions";
import { CLICKUP_LIST_IDS } from "../../constants/clickUpCustomFields";

import NewTasksTable from "../../components/NewTasksTable";
import { Flex } from "antd";
import { MQMSTask, Task } from "../../types/Task";
import { useLoaderData } from "react-router-dom";

const LIST_ID = CLICKUP_LIST_IDS.cciBau;
const DEFAULT_SEARCH_PARAMS = {};

function TaskSync() {
  const [MQMSTasks, setMQMSTasks] = useState<MQMSTask[]>([]);
  const clickUpTasks = useLoaderData() as Task[];
  const newMqmsTasks =
    MQMSTasks.length > 0 ? getNewTasksFromMqms(MQMSTasks, clickUpTasks) : [];

  return (
    <Flex vertical gap="small" align="center" justify="center">
      <ExcelUploader setData={setMQMSTasks} />
      {newMqmsTasks.length > 0 ? (
        <NewTasksTable
          newMqmsTasks={newMqmsTasks}
          setMQMSTasks={setMQMSTasks}
        />
      ) : null}
      {!clickUpTasks && <p>Obteniendo datos de ClickUp...</p>}
    </Flex>
  );
}

export async function loader() {
  try {
    const clickUpTasks = await fetchTasks(LIST_ID, DEFAULT_SEARCH_PARAMS);
    return clickUpTasks;
  } catch (error: any) {
    throw new Response(error.message, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}

export default TaskSync;
