import TasksTable from "./TasksTable";
import { MQMSTask } from "../types.d";

interface Props {
  newMqmsTasks: MQMSTask[];
}

function NewTasksTable({ newMqmsTasks }: Props) {
  const handleAction = (row: MQMSTask) => {
    console.log(row);
  };

  return (
    <div>
      <TasksTable
        data={newMqmsTasks}
        renderAdditionalColumns={(row) => (
          <button onClick={() => handleAction(row)}>Action</button>
        )}
      />
    </div>
  );
}

export default NewTasksTable;
