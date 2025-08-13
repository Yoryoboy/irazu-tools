import { Flex, Radio, Space } from 'antd';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import type { RadioChangeEvent } from 'antd';
import { useState } from 'react';

import { CLICKUP_LIST_IDS } from '../../utils/config';
import TaskSync from './TaskSync';

const options: CheckboxGroupProps<string>['options'] = [
  { label: 'High Split', value: 'highsplit' },
  { label: 'BAU', value: 'bau' },
];

const { cciBau, cciHs, trueNetBau, techservBau } = CLICKUP_LIST_IDS;

// Options for the BAU sublist selector
const bauOptions: CheckboxGroupProps<string>['options'] = [
  { label: 'CCI', value: 'cci' },
  { label: 'TrueNet', value: 'truenet' },
];
const DEFAULT_SEARCH_PARAMS = {};

function TaskSyncListSelector() {
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [selectedBauType, setSelectedBauType] = useState<string | null>(null);

  let taskSyncOptions: {
    listId: string;
    searchParams: typeof DEFAULT_SEARCH_PARAMS;
  } | null = null;

  if (selectedList === 'highsplit') {
    taskSyncOptions = {
      listId: cciHs,
      searchParams: DEFAULT_SEARCH_PARAMS,
    };
  } else if (selectedList === 'bau' && selectedBauType) {
    // Only set options if both BAU and a subtype are selected
    if (selectedBauType === 'cci') {
      taskSyncOptions = {
        listId: cciBau,
        searchParams: DEFAULT_SEARCH_PARAMS,
      };
    } else if (selectedBauType === 'truenet') {
      taskSyncOptions = {
        listId: trueNetBau,
        searchParams: DEFAULT_SEARCH_PARAMS,
      };
    }
  }

  // Handle main list selection and reset BAU subtype when changing main selection
  const handleMainListChange = (e: RadioChangeEvent) => {
    setSelectedList(e.target.value);
    if (e.target.value !== 'bau') {
      setSelectedBauType(null);
    }
  };

  return (
    <Flex vertical gap="small" align="center" justify="center">
      <Radio.Group
        block
        options={options}
        optionType="button"
        value={selectedList}
        buttonStyle="solid"
        onChange={handleMainListChange}
        style={{ width: '50%' }}
      />

      {/* Show BAU subtype selector only when BAU is selected */}
      {selectedList === 'bau' && (
        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <p>Seleccione el tipo de BAU:</p>
          <Radio.Group
            options={bauOptions}
            optionType="button"
            value={selectedBauType}
            buttonStyle="solid"
            onChange={(e: RadioChangeEvent) => setSelectedBauType(e.target.value)}
            style={{ width: '50%' }}
          />
        </Space>
      )}

      {!taskSyncOptions ? (
        <p>Seleccione una lista{selectedList === 'bau' ? ' y un tipo de BAU' : ''}</p>
      ) : (
        <TaskSync listId={taskSyncOptions.listId} searchParams={taskSyncOptions.searchParams} />
      )}
    </Flex>
  );
}

export default TaskSyncListSelector;
