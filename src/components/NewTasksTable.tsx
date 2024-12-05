import { Table, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
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

  // Definir columnas para la tabla
  const columns: ColumnsType<MQMSTask> = [
    {
      title: "JOB_NAME",
      dataIndex: "JOB_NAME",
      key: "JOB_NAME",
    },
    {
      title: "EXTERNAL_ID",
      dataIndex: "EXTERNAL_ID",
      key: "EXTERNAL_ID",
    },
    {
      title: "SECONDARY_EXTERNAL_ID",
      dataIndex: "SECONDARY_EXTERNAL_ID",
      key: "SECONDARY_EXTERNAL_ID",
    },
    {
      title: "REQUEST_NAME",
      dataIndex: "REQUEST_NAME",
      key: "REQUEST_NAME",
    },
    {
      title: "PROJECT_TYPE",
      dataIndex: "PROJECT_TYPE",
      key: "PROJECT_TYPE",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleAction(record)}>
            Sync Task
          </Button>
        </Space>
      ),
    },
  ];

  const dataSource = newMqmsTasks.map((task) => ({
    ...task,
    key: task.EXTERNAL_ID,
  }));

  return (
    <div>
      <Table<MQMSTask>
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
      <Button type="primary" onClick={handleSyncAll} style={{ marginTop: 16 }}>
        Sync All Tasks
      </Button>
    </div>
  );
}

export default NewTasksTable;
