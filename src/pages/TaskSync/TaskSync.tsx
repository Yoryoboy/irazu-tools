import { useState } from 'react';
import ExcelUploader from '../../components/ExcelUploader';
import { useFetchClickUpTasks } from '../../hooks/useClickUp';
import { getNewTasksFromMqms } from '../../utils/tasksFunctions';

import NewTasksTable from '../../components/NewTasksTable';
import { Flex } from 'antd';
import { MQMSTask } from '../../types/Task';
import { SearchParams } from '../../types/SearchParams';

interface Props {
  listId: string;
  searchParams: SearchParams;
}

function TaskSync({ listId, searchParams }: Props) {
  const [MQMSTasks, setMQMSTasks] = useState<MQMSTask[]>([]);
  const { clickUpTasks } = useFetchClickUpTasks(listId, searchParams);
  const newMqmsTasks = MQMSTasks.length > 0 ? getNewTasksFromMqms(MQMSTasks, clickUpTasks) : [];

  return (
    <Flex vertical gap="small" align="center" justify="center">
      <ExcelUploader setData={setMQMSTasks} />
      {clickUpTasks.length > 0 && newMqmsTasks.length > 0 ? (
        <NewTasksTable newMqmsTasks={newMqmsTasks} setMQMSTasks={setMQMSTasks} listId={listId} />
      ) : null}
      {clickUpTasks.length === 0 && <p>Obteniendo datos de ClickUp...</p>}
    </Flex>
  );
}

export default TaskSync;
