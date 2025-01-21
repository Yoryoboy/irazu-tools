import { Flex, Radio } from "antd";
import { CheckboxGroupProps } from "antd/es/checkbox";
import { useState } from "react";

import { CLICKUP_LIST_IDS } from "../../utils/config";
import TaskSync from "./TaskSync";

const options: CheckboxGroupProps<string>["options"] = [
  { label: "High Split", value: "highsplit" },
  { label: "BAU", value: "bau" },
];

const { cciBau, cciHs } = CLICKUP_LIST_IDS;
const DEFAULT_SEARCH_PARAMS = {};

function TaskSyncListSelector() {
  const [selectedList, setSelectedList] = useState<string | null>(null);

  let taskSyncOptions: {
    listId: string;
    searchParams: typeof DEFAULT_SEARCH_PARAMS;
  } | null = null;

  if (selectedList === "highsplit") {
    taskSyncOptions = {
      listId: cciHs,
      searchParams: DEFAULT_SEARCH_PARAMS,
    };
  } else if (selectedList === "bau") {
    taskSyncOptions = {
      listId: cciBau,
      searchParams: DEFAULT_SEARCH_PARAMS,
    };
  }

  return (
    <Flex vertical gap="small" align="center" justify="center">
      <Radio.Group
        block
        options={options}
        optionType="button"
        value={selectedList}
        buttonStyle="solid"
        onChange={(e) => setSelectedList(e.target.value)}
        style={{ width: "50%" }}
      />
      {!taskSyncOptions ? (
        <p>Seleccione una lista</p>
      ) : (
        <TaskSync
          listId={taskSyncOptions.listId}
          searchParams={taskSyncOptions.searchParams}
        />
      )}
    </Flex>
  );
}

export default TaskSyncListSelector;
