import { Result } from "../../types/MQMS";
import { ExtractedTaskFieldValues } from "../../types/Task";

interface Props {
  MQMSTasks: Result[];
  sentTasks: ExtractedTaskFieldValues[];
}

function ComparisonTable({ MQMSTasks, sentTasks }: Props) {
  console.log(MQMSTasks, sentTasks);
  const filteredMQMSTasks = MQMSTasks.filter((task) => {
    return sentTasks.find((sentTask) => {
      return sentTask.name === task.secondaryExternalID;
    });
  });

  console.log(filteredMQMSTasks);

  return <div></div>;
}

export default ComparisonTable;
