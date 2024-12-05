import { Table, Button } from "antd";
import { MQMSTask } from "../types.d";
import { getColumns } from "./tableColumns";
import { handleSyncAll } from "../utils/tasksFunctions";

interface Props {
  newMqmsTasks: MQMSTask[];
  setMQMSTasks: (tasks: MQMSTask[]) => void;
}

function NewTasksTable({ newMqmsTasks, setMQMSTasks }: Props) {
  const dataSource = newMqmsTasks.map((task) => ({
    ...task,
    key: task.EXTERNAL_ID,
  }));

  const columns = getColumns(newMqmsTasks, setMQMSTasks);

  return (
    <div>
      <Table<MQMSTask>
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
      <Button
        type="primary"
        onClick={() => handleSyncAll(newMqmsTasks, setMQMSTasks)}
        style={{ marginTop: 16 }}
      >
        Sync All Tasks
      </Button>
    </div>
  );
}

export default NewTasksTable;
