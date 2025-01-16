import { useState } from "react";
import { Result } from "../types/MQMS";
import { ExtractedTaskFieldValues } from "../types/Task";

export function useFileteredMQMSTaks(
  MQMSTasks: Result[],
  ClickUpSentTasks: ExtractedTaskFieldValues[]
) {
  const [filteredMQMSTasks, setFilteredMQMSTasks] = useState<Result[]>(
    MQMSTasks.filter((task) => {
      return ClickUpSentTasks.some(
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

  const closedAndPreclosedTasksWithClickUpID = closedAndPreclosedTasks.map(
    (task) => {
      const sentTask = ClickUpSentTasks.find(
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

  return {
    filteredMQMSTasks,
    setFilteredMQMSTasks,
    closedAndPreclosedTasksWithClickUpID,
  };
}
