import { Result } from "../../types/MQMS";
import { ExtractedTaskFieldValues } from "../../types/Task";
import { Table } from "antd";

interface Props {
  MQMSTasks: Result[];
  sentTasks: ExtractedTaskFieldValues[];
}

interface DataSourceItem {
  key: string;
  jobID: string;
  secondaryID: string;
  mqmsStatus: string;
  mqmsAssignedUser: string;
  module: string;
}

function ComparisonTable({ MQMSTasks, sentTasks }: Props) {
  const filteredMQMSTasks = MQMSTasks.filter((task) => {
    return sentTasks.some(
      (sentTask) =>
        sentTask.name === task.externalID &&
        sentTask["SECONDARY ID"] === task.secondaryExternalID
    );
  });

  console.log("sent tasks", sentTasks);

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
            title: "CLICKUP STATUS",
            dataIndex: "clickupStatus",
            key: "CLICKUP STATUS",
          },
          {
            title: "CLICKUP ASSIGNEE",
            dataIndex: "clickupAssignee",
            key: "CLICKUP ASSIGNEE",
          },
          {
            title: "MQMS STATUS",
            dataIndex: "mqmsStatus",
            key: "MQMS STATUS",
            filters: Array.from(
              new Set(filteredMQMSTasks.map((task) => task.status))
            ).map((status) => ({
              text: status,
              value: status,
            })),
            onFilter: (value: string, record: DataSourceItem) =>
              record.mqmsStatus === value,
          },
          {
            title: "MQMS ASSIGNED USER",
            dataIndex: "mqmsAssignedUser",
            key: "MQMS ASSIGNED USER",
            filters: Array.from(
              new Set(filteredMQMSTasks.map((task) => task.currentAssignedUser))
            ).map((user) => ({
              text: user,
              value: user,
            })),
            onFilter: (value: string, record: DataSourceItem) =>
              record.mqmsAssignedUser === value,
          },
          {
            title: "MODULE",
            dataIndex: "module",
            key: "MODULE",
          },
        ]
      : [];

  const dataSource = filteredMQMSTasks.map((task) => ({
    key: task.uuid,
    jobID: task.externalID,
    secondaryID: task.secondaryExternalID,
    clickupStatus: sentTasks
      .find((sentTask) => sentTask.name === task.externalID)
      ?.status?.toString()
      .toUpperCase(),
    clickupAssignee:
      sentTasks.find((sentTask) => sentTask.name === task.externalID)
        ?.assignees ?? "",
    mqmsStatus: task.status,
    mqmsAssignedUser: task.currentAssignedUser ?? "",
    module: task.module ?? "",
  }));

  return <Table dataSource={dataSource} columns={columns} pagination={false} />;
}

export default ComparisonTable;
