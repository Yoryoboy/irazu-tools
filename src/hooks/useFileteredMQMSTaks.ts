import { useState } from 'react';
import { MQMSTasksWithClickUpID, TaskDatum } from '../types/MQMS';
import { ExtractedTaskFieldValues } from '../types/Task';

export function useFileteredMQMSTaks(
  MQMSTasks: TaskDatum[],
  ClickUpSentTasks: ExtractedTaskFieldValues[]
) {
  const [filteredMQMSTasksWithClickUpID, setFilteredMQMSTasksWithClickUpID] = useState<
    MQMSTasksWithClickUpID[]
  >(
    MQMSTasks.map(task => {
      const sentTask = ClickUpSentTasks.find(
        currSentTask => currSentTask['WORK REQUEST ID'] === task.uuid
      );

      if (!sentTask?.id) {
        return { ...task, clickUpID: '' };
      }
      return { ...task, clickUpID: sentTask?.id?.toString() };
    })
  );

  const [closedAndPreclosedTasks, setClosedAndPreclosedTasks] = useState<TaskDatum[]>(
    MQMSTasks.filter(task => task.status.name === 'CLOSED' || task.status.name === 'PRECLOSE')
  );

  const closedAndPreclosedTasksWithClickUpID: MQMSTasksWithClickUpID[] =
    closedAndPreclosedTasks.map(task => {
      const sentTask = ClickUpSentTasks.find(
        currSentTask =>
          currSentTask.name === task.externalID &&
          currSentTask['SECONDARY ID'] === task.secondaryExternalID
      );

      if (!sentTask?.id) {
        console.log(sentTask);
        console.log(
          `MQMS Task ${task.externalID} with secondary ID ${task.secondaryExternalID} not found in ClickUp sent tasks`
        );
      }

      return { ...task, clickUpID: sentTask?.id?.toString() };
    });

  return {
    filteredMQMSTasksWithClickUpID,
    setFilteredMQMSTasksWithClickUpID,
    closedAndPreclosedTasksWithClickUpID,
    setClosedAndPreclosedTasks,
  };
}
