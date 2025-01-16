import { Result } from "../../types/MQMS";
import { ExtractedTaskFieldValues } from "../../types/Task";
import { Button, Space, Table } from "antd";
import { changeTaskStatus } from "../../utils/clickUpApi";
import { Key } from "antd/es/table/interface";
import { useFileteredMQMSTaks } from "../../hooks/useFileteredMQMSTaks";

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
  mqmsModule: string;
  clickUpID: string;
}

function ComparisonTable({ MQMSTasks, sentTasks }: Props) {
  const {
    filteredMQMSTasks,
    setFilteredMQMSTasks,
    closedAndPreclosedTasksWithClickUpID,
  } = useFileteredMQMSTaks(MQMSTasks, sentTasks);

  async function handleAction(ClickUpTaskId: string, key: string) {
    const result = await changeTaskStatus("approved", ClickUpTaskId);

    if (result.status === "error") {
      console.error(result.message);
      return;
    }
    setFilteredMQMSTasks(filteredMQMSTasks.filter((task) => task.uuid !== key));
  }

  async function handleApproveAll() {
    const results = await Promise.allSettled(
      closedAndPreclosedTasksWithClickUpID.map((task) =>
        changeTaskStatus("approved", task.clickUpID)
      )
    );

    console.log(results);
  }

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
            onFilter: (value: boolean | Key, record: DataSourceItem) =>
              record.mqmsStatus === value,
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
            onFilter: (value: boolean | Key, record: DataSourceItem) =>
              record.mqmsAssignedUser === value,
          },
          {
            title: "MODULE",
            dataIndex: "mqmsModule",
            key: "MODULE",
          },
          {
            title: "ACTION",
            key: "action",
            render: (_: undefined, record: DataSourceItem) => (
              <Space size="middle">
                <Button
                  type="primary"
                  disabled={
                    record.mqmsStatus !== "CLOSED" &&
                    record.mqmsStatus !== "PRECLOSE"
                  }
                  onClick={() => handleAction(record.clickUpID, record.key)}
                >
                  Mark as Approved
                </Button>
              </Space>
            ),
          },
        ]
      : [];

  const dataSource = filteredMQMSTasks.map((task) => ({
    key: task.uuid,
    jobID: task.externalID,
    secondaryID: task.secondaryExternalID,
    clickupStatus:
      sentTasks
        .find((sentTask) => sentTask.name === task.externalID)
        ?.status?.toString()
        .toUpperCase() ?? "",
    clickupAssignee:
      sentTasks.find((sentTask) => sentTask.name === task.externalID)
        ?.assignees ?? "",
    mqmsStatus: task.status,
    mqmsAssignedUser: task.currentAssignedUser ?? "",
    mqmsModule: task.module ?? "",
    clickUpID:
      sentTasks
        .find((sentTask) => sentTask.name === task.externalID)
        ?.id?.toString() ?? "",
  }));

  console.log(dataSource);

  return (
    <div>
      <h2>
        Tasks Closed and Preclosed:{" "}
        {closedAndPreclosedTasksWithClickUpID.length}
      </h2>
      {closedAndPreclosedTasksWithClickUpID.length > 0 && (
        <Button type="primary" onClick={handleApproveAll}>
          Approve All Closed and Preclose Tasks
        </Button>
      )}
      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </div>
  );
}

export default ComparisonTable;
