import { Key } from "antd/es/table/interface";
import { TaskDatum } from "../../../types/MQMS";

export interface TableDataType {
  key: string;
  jobID: string;
  secondaryID: string;
  clickupStatus: string;
  clickupAssignee: string;
  mqmsStatus: string;
  mqmsAssignedUser: string;
  mqmsModule: string;
  clickUpID: string;
  action: JSX.Element;
}

export function createColumnsForComparisonTable(
  filteredMQMSTasks: TaskDatum[]
) {
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
              new Set(filteredMQMSTasks.map((task) => task.status.name))
            ).map((status) => ({
              text: status,
              value: status,
            })),
            onFilter: (value: boolean | Key, record: TableDataType) =>
              record.mqmsStatus === value,
          },
          {
            title: "MQMS ASSIGNED USER",
            dataIndex: "mqmsAssignedUser",
            key: "MQMS ASSIGNED USER",
            filters: Array.from(
              new Set(
                filteredMQMSTasks.map(
                  (task) =>
                    `${task.currentAssignedUser.firstName} ${task.currentAssignedUser.lastName}`
                )
              )
            ).map((user) => ({
              text: user,
              value: user,
            })),
            onFilter: (value: boolean | Key, record: TableDataType) =>
              record.mqmsAssignedUser === value,
          },
          {
            title: "MODULE",
            dataIndex: "mqmsModule",
            key: "MODULE",
          },
          {
            title: "ACTION",
            dataIndex: "action",
            key: "ACTION",
          },
        ]
      : [];

  return columns;
}
