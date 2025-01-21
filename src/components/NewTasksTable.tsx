import { Table, Button } from "antd";
import { getColumns } from "./tableColumns";
import { handleSyncAll } from "../utils/tasksFunctions";
import { MQMSTask } from "../types/Task";

interface Props {
  newMqmsTasks: MQMSTask[];
  setMQMSTasks: (tasks: MQMSTask[]) => void;
  listId: string;
}

function NewTasksTable({ newMqmsTasks, setMQMSTasks, listId }: Props) {
  const dataSource = newMqmsTasks.map((task) => ({
    ...task,
    key: task.EXTERNAL_ID,
  }));

  const columns = getColumns(newMqmsTasks, setMQMSTasks, listId);

  return (
    <div>
      <Table<MQMSTask>
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
      <Button
        type="primary"
        onClick={() => handleSyncAll(newMqmsTasks, setMQMSTasks, listId)}
        style={{ marginTop: 16 }}
      >
        Sync All Tasks
      </Button>
    </div>
  );
}

export default NewTasksTable;
