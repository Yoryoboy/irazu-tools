import { Result } from "../../types/MQMS";
import { ExtractedTaskFieldValues } from "../../types/Task";
import { Button, Space, Table } from "antd";
import { changeTaskStatus } from "../../utils/clickUpApi";
import { useFileteredMQMSTaks } from "../../hooks/useFileteredMQMSTaks";
import { createColumnsForComparisonTable } from "./ComparionTable.columns";

interface Props {
  MQMSTasks: Result[];
  sentTasks: ExtractedTaskFieldValues[];
}

function ComparisonTable({ MQMSTasks, sentTasks }: Props) {
  const {
    filteredMQMSTasksWithClickUpID,
    setFilteredMQMSTasks,
    closedAndPreclosedTasksWithClickUpID,
  } = useFileteredMQMSTaks(MQMSTasks, sentTasks);

  async function handleAction(ClickUpTaskId: string, key: string) {
    const result = await changeTaskStatus("approved", ClickUpTaskId);

    if (result.status === "error") {
      console.error(result.message);
      return;
    }
    setFilteredMQMSTasks(
      filteredMQMSTasksWithClickUpID.filter((task) => task.uuid !== key)
    );
  }

  async function handleApproveAll() {
    const results = await Promise.allSettled(
      closedAndPreclosedTasksWithClickUpID.map((task) =>
        changeTaskStatus("approved", task.clickUpID)
      )
    );

    console.log(results);
  }

  const columns = createColumnsForComparisonTable(
    filteredMQMSTasksWithClickUpID
  );

  const dataSource = filteredMQMSTasksWithClickUpID.map((task) => ({
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
    clickUpID: task.clickUpID ?? "",
    action: (
      <Space size="middle">
        <Button
          type="primary"
          disabled={task.status !== "CLOSED" && task.status !== "PRECLOSE"}
          onClick={() => handleAction(task.clickUpID, task.key)}
        >
          Mark as Approved
        </Button>
      </Space>
    ),
  }));

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
