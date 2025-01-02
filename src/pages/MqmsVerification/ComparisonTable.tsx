import { Data, Result } from "../../types/MQMS";
import { ExtractedTaskFieldValues } from "../../types/Task";
import { Table } from "antd";

interface Props {
  MQMSTasks: Result[];
  sentTasks: ExtractedTaskFieldValues[];
}

interface DataSourceItem {
  key: string;
  jobID: string;
  mqmsStatus: string;
}

function ComparisonTable({ MQMSTasks, sentTasks }: Props) {
  const filteredMQMSTasks = MQMSTasks.filter((task) => {
    return sentTasks.some(
      (sentTask) =>
        sentTask.name === task.externalID &&
        sentTask["SECONDARY ID"] === task.secondaryExternalID
    );
  });

  console.log(filteredMQMSTasks);

  const columns =
    filteredMQMSTasks.length > 0
      ? [
          {
            title: "JOB ID",
            dataIndex: "jobID",
            key: "JOB ID",
          },
          {
            title: "SECONDARY ID",
            dataIndex: "secondaryID",
            key: "SECONDARY ID",
          },
          {
            title: "MQMS STATUS",
            dataIndex: "mqmsStatus",
            key: "MQMS STATUS",
            filters: Array.from(
              new Set(
                filteredMQMSTasks.map((task) => task.status) // Extraer los valores únicos de "status"
              )
            ).map((status) => ({
              text: status, // Texto visible en el filtro
              value: status, // Valor interno para filtrar
            })),
            onFilter: (value: string, record: DataSourceItem) =>
              record.mqmsStatus === value, // Función para filtrar
          },
          {
            title: "CURRENT ASSIGNED USER",
            dataIndex: "currentAssignedUser",
            key: "CURRENT ASSIGNED USER",
          },
          {
            title: "MODULE",
            dataIndex: "module",
            key: "MODULE",
          },
        ]
      : [];

  const dataSource: DataSourceItem[] = filteredMQMSTasks.map((task) => ({
    key: task.uuid,
    jobID: task.externalID,
    secondaryID: task.secondaryExternalID,
    mqmsStatus: task.status,
    currentAssignedUser: task.currentAssignedUser,
    module: task.module,
  }));

  return <Table dataSource={dataSource} columns={columns} pagination={false} />;
}

export default ComparisonTable;
