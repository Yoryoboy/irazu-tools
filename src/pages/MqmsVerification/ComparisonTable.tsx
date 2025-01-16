import { ClosedAndPreclosedTasksWithClickUpID, Result } from "../../types/MQMS";
import { ExtractedTaskFieldValues } from "../../types/Task";
import { Button, Space, Table } from "antd";
import { changeTaskStatus } from "../../utils/clickUpApi";
import { useState } from "react";

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
  const [filteredMQMSTasks, setFilteredMQMSTasks] = useState<Result[]>(
    MQMSTasks.filter((task) => {
      return sentTasks.some(
        (sentTask) =>
          sentTask.name === task.externalID &&
          sentTask["SECONDARY ID"] === task.secondaryExternalID
      );
    })
  );

  const closedAndPreclosedTasks =
    filteredMQMSTasks.length > 0
      ? filteredMQMSTasks.filter(
          (task) => task.status === "CLOSED" || task.status === "PRECLOSE"
        )
      : [];

  async function handleAction(record: DataSourceItem) {
    console.log(" record", record);
    const { clickUpID } = record;
    const body = JSON.stringify({
      status: "approved",
    });
    const result = await changeTaskStatus(body, clickUpID);

    if (result.status === "error") {
      console.error(result.message);
      return;
    }
    setFilteredMQMSTasks(
      filteredMQMSTasks.filter((task) => task.uuid !== record.key)
    );
  }

  async function handleApproveAll() {
    const closedAndPreclosedTasksWithClickUpID = closedAndPreclosedTasks.map(
      (task) => {
        const sentTask = sentTasks.find(
          (currSentTask) =>
            currSentTask.name === task.externalID &&
            currSentTask["SECONDARY ID"] === task.secondaryExternalID
        );

        if (!sentTask?.id) {
          throw new Error(
            `MQMS Task ${task.externalID} with secondary ID ${task.secondaryExternalID} not found in ClickUp sent tasks`
          );
        }

        return { ...task, clickUpID: sentTask?.id?.toString() };
      }
    );

    const body = JSON.stringify({
      status: "approved",
    });

    const results = await Promise.allSettled(
      closedAndPreclosedTasksWithClickUpID.map((task) =>
        changeTaskStatus(body, task.clickUpID)
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
            dataIndex: "mqmsModule",
            key: "MODULE",
          },
          {
            title: "ACTION",
            key: "action",
            render: (_, record: DataSourceItem) => (
              <Space size="middle">
                <Button
                  type="primary"
                  disabled={
                    record.mqmsStatus !== "CLOSED" &&
                    record.mqmsStatus !== "PRECLOSE"
                  }
                  onClick={() => handleAction(record)}
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
    clickupStatus: sentTasks
      .find((sentTask) => sentTask.name === task.externalID)
      ?.status?.toString()
      .toUpperCase(),
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

  return (
    <div>
      <h2>Tasks Closed and Preclosed: {closedAndPreclosedTasks.length}</h2>
      {closedAndPreclosedTasks.length > 0 && (
        <Button type="primary" onClick={handleApproveAll}>
          Approve All Closed and Preclose Tasks
        </Button>
      )}
      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </div>
  );
}

export default ComparisonTable;
