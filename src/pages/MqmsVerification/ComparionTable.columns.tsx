import { Key } from "antd/es/table/interface";
import { Result } from "../../types/MQMS";

export function createColumnsForComparisonTable(filteredMQMSTasks: Result[]) {
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
              value: status as Key,
            })),
            onFilter: (
              value: boolean | Key,
              record: { [key: string]: string }
            ) => record.mqmsStatus === value,
          },
          {
            title: "MQMS ASSIGNED USER",
            dataIndex: "mqmsAssignedUser",
            key: "MQMS ASSIGNED USER",
            filters: Array.from(
              new Set(filteredMQMSTasks.map((task) => task.currentAssignedUser))
            ).map((user) => ({
              text: user as string,
              value: user as Key,
            })),
            onFilter: (
              value: boolean | Key,
              record: { [key: string]: string }
            ) => record.mqmsAssignedUser === value,
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
