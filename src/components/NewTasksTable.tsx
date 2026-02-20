import { useState } from 'react';
import { Table, Button, Checkbox, Space, Flex } from 'antd';
import { getColumns } from './tableColumns';
import { handleSyncAllWithPlatforms } from '../utils/tasksFunctions';
import { MQMSTask, SyncPlatform, PlatformSyncResult } from '../types/Task';

interface Props {
  newMqmsTasks: MQMSTask[];
  setMQMSTasks: (tasks: MQMSTask[]) => void;
  listId: string;
}

function NewTasksTable({ newMqmsTasks, setMQMSTasks, listId }: Props) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SyncPlatform[]>([
    'clickup',
    'workflow',
  ]);
  const [syncResults, setSyncResults] = useState<Map<string, PlatformSyncResult[]>>(new Map());
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());

  const dataSource = newMqmsTasks.map(task => ({
    ...task,
    key: task.EXTERNAL_ID,
  }));

  const handlePlatformChange = (platform: SyncPlatform, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms(prev => [...prev, platform]);
    } else {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    }
  };

  const handleSyncAllClick = async () => {
    if (selectedPlatforms.length === 0) return;
    setIsSyncing(true);
    setLoadingTasks(new Set(newMqmsTasks.map(t => t.EXTERNAL_ID)));
    try {
      const results = await handleSyncAllWithPlatforms(
        newMqmsTasks,
        setMQMSTasks,
        listId,
        selectedPlatforms
      );
      setSyncResults(results);
    } finally {
      setIsSyncing(false);
      setLoadingTasks(new Set());
    }
  };

  const columns = getColumns(
    newMqmsTasks,
    setMQMSTasks,
    listId,
    selectedPlatforms,
    syncResults,
    setSyncResults,
    loadingTasks
  );

  return (
    <div>
      <Flex gap="middle" align="center" style={{ marginBottom: 16 }}>
        <span>Sync to:</span>
        <Space>
          <Checkbox
            checked={selectedPlatforms.includes('clickup')}
            onChange={e => handlePlatformChange('clickup', e.target.checked)}
          >
            ClickUp
          </Checkbox>
          <Checkbox
            checked={selectedPlatforms.includes('workflow')}
            onChange={e => handlePlatformChange('workflow', e.target.checked)}
          >
            Workflow
          </Checkbox>
        </Space>
      </Flex>
      <Table<MQMSTask>
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowClassName={record => {
          const results = syncResults.get(record.EXTERNAL_ID) ?? [];
          const hasError = results.some(r => r.status === 'error');
          return hasError ? 'sync-row-error' : '';
        }}
      />
      <Button
        type="primary"
        onClick={handleSyncAllClick}
        style={{ marginTop: 16 }}
        disabled={selectedPlatforms.length === 0 || isSyncing}
        loading={isSyncing}
      >
        Sync All Tasks
      </Button>
    </div>
  );
}

export default NewTasksTable;
