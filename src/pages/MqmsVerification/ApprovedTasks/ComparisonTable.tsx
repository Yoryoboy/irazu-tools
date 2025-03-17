import { TaskDatum } from "../../../types/MQMS";
import { ExtractedTaskFieldValues } from "../../../types/Task";
import { Button, Space, Table } from "antd";
import { changeTaskStatus } from "../../../utils/clickUpApi";
import { useFileteredMQMSTaks } from "../../../hooks/useFileteredMQMSTaks";
import {
  createColumnsForComparisonTable,
  TableDataType,
} from "./ComparionTable.columns";

interface Props {
  MQMSTasks: TaskDatum[];
  sentTasks: ExtractedTaskFieldValues[];
}

function ComparisonTable({ MQMSTasks, sentTasks }: Props) {
  const {
    filteredMQMSTasksWithClickUpID,
    closedAndPreclosedTasksWithClickUpID,
    setFilteredMQMSTasksWithClickUpID,
    setClosedAndPreclosedTasks,
  } = useFileteredMQMSTaks(MQMSTasks, sentTasks);

  async function handleAction(ClickUpTaskId: string, uuid: string) {
    const result = await changeTaskStatus("approved", ClickUpTaskId);

    if (result.status === "error") {
      console.error(result.message);
      return;
    }

    setFilteredMQMSTasksWithClickUpID(
      filteredMQMSTasksWithClickUpID.filter((task) => task.uuid !== uuid)
    );
    setClosedAndPreclosedTasks(
      closedAndPreclosedTasksWithClickUpID.filter((task) => task.uuid !== uuid)
    );
  }

  async function handleApproveAll() {
    const results = await Promise.allSettled(
      closedAndPreclosedTasksWithClickUpID.map((task) =>
        changeTaskStatus("approved", task.clickUpID)
      )
    );

    console.log(results);

    setFilteredMQMSTasksWithClickUpID(
      filteredMQMSTasksWithClickUpID.filter((task) => {
        return !closedAndPreclosedTasksWithClickUpID.some(
          (closedAndPreclosedTask) => closedAndPreclosedTask.uuid === task.uuid
        );
      })
    );
    setClosedAndPreclosedTasks(
      closedAndPreclosedTasksWithClickUpID.filter((task) => {
        return !closedAndPreclosedTasksWithClickUpID.some(
          (closedAndPreclosedTask) => closedAndPreclosedTask.uuid === task.uuid
        );
      })
    );
  }

  const columns = createColumnsForComparisonTable(
    filteredMQMSTasksWithClickUpID
  );

  const dataSource: TableDataType[] = filteredMQMSTasksWithClickUpID.map(
    (task) => ({
      key: task.uuid,
      jobID: task.externalID,
      secondaryID: task.secondaryExternalID,
      clickupStatus:
        sentTasks
          .find((sentTask) => sentTask.name === task.externalID)
          ?.status?.toString()
          .toUpperCase() ?? "",
      clickupAssignee:
        sentTasks
          .find((sentTask) => sentTask.name === task.externalID)
          ?.assignees?.toString() ?? "",
      mqmsStatus: task.status.name,
      mqmsAssignedUser: `${task.currentAssignedUser.firstName} ${task.currentAssignedUser.lastName}`,
      mqmsModule: task.currentAssignedModule.name ?? "",
      clickUpID: task.clickUpID ?? "",
      action: (
        <Space size="middle">
          <Button
            type="primary"
            disabled={
              task.status.name !== "CLOSED" && task.status.name !== "PRECLOSE"
            }
            onClick={() => handleAction(task.clickUpID, task.uuid)}
          >
            Mark as Approved
          </Button>
        </Space>
      ),
    })
  );

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
      <Table<TableDataType>
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}

export default ComparisonTable;
