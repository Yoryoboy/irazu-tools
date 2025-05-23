import { Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { handleAction } from "../utils/tasksFunctions";
import { MQMSTask } from "../types/Task";

// Definir columnas para la tabla
export const getColumns = (
  newMqmsTasks: MQMSTask[],
  setMQMSTasks: (tasks: MQMSTask[]) => void,
  listId: string
): ColumnsType<MQMSTask> => [
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
    title: "NODE_NAME",
    dataIndex: "NODE_NAME",
    key: "NODE_NAME",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <Button
          type="primary"
          onClick={() =>
            handleAction(record, newMqmsTasks, setMQMSTasks, listId)
          }
        >
          Sync Task
        </Button>
      </Space>
    ),
  },
];
