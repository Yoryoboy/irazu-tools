import { Result } from "../../types/MQMS";
import { ExtractedTaskFieldValues } from "../../types/Task";

interface Props {
  MQMSTasks: Result[];
  sentTasks: ExtractedTaskFieldValues[];
}

function ComparisonTable({ MQMSTasks, sentTasks }: Props) {
  const filteredMQMSTasks = MQMSTasks.filter((task) => {
    return sentTasks.some(
      (sentTask) =>
        sentTask.name === task.externalID &&
        sentTask["SECONDARY ID"] === task.secondaryExternalID
    );
  });

  console.log(filteredMQMSTasks);

  return <div></div>;
}

export default ComparisonTable;
