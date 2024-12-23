import { useState } from "react";
import ExcelUploader from "../../components/ExcelUploader";
import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { getNewTasksFromMqms } from "../../utils/tasksFunctions";
import { CLICKUP_LIST_IDS } from "../../constants/clickUpCustomFields";

import NewTasksTable from "../../components/NewTasksTable";
import { Flex } from "antd";
import { MQMSTask } from "../../types/Task";

const LIST_ID = CLICKUP_LIST_IDS.cciBau;

function TaskSync() {
  const [MQMSTasks, setMQMSTasks] = useState<MQMSTask[]>([]);
  const { clickUpTasks } = useFetchClickUpTasks(LIST_ID);
  const newMqmsTasks =
    MQMSTasks.length > 0 ? getNewTasksFromMqms(MQMSTasks, clickUpTasks) : [];
  return (
    <Flex vertical gap="small" align="center" justify="center">
      <ExcelUploader setData={setMQMSTasks} />
      {clickUpTasks.length > 0 && newMqmsTasks.length > 0 ? (
        <NewTasksTable
          newMqmsTasks={newMqmsTasks}
          setMQMSTasks={setMQMSTasks}
        />
      ) : null}
      {clickUpTasks.length === 0 && <p>Obteniendo datos de ClickUp...</p>}
    </Flex>
  );
}

export default TaskSync;
