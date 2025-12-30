import { useState } from 'react';
import { Button, Space, Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { handleActionWithPlatforms } from '../utils/tasksFunctions';
import { MQMSTask, SyncPlatform, PlatformSyncResult } from '../types/Task';

interface SyncStatusProps {
  platform: SyncPlatform;
  result?: PlatformSyncResult;
  isSelected: boolean;
  isLoading: boolean;
}

interface SyncActionButtonProps {
  record: MQMSTask;
  newMqmsTasks: MQMSTask[];
  setMQMSTasks: (tasks: MQMSTask[]) => void;
  listId: string;
  selectedPlatforms: SyncPlatform[];
  setSyncResults: React.Dispatch<React.SetStateAction<Map<string, PlatformSyncResult[]>>>;
}

function SyncActionButton({
  record,
  newMqmsTasks,
  setMQMSTasks,
  listId,
  selectedPlatforms,
  setSyncResults,
}: SyncActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (selectedPlatforms.length === 0) return;
    setIsLoading(true);
    try {
      const results = await handleActionWithPlatforms(
        record,
        newMqmsTasks,
        setMQMSTasks,
        listId,
        selectedPlatforms
      );
      setSyncResults(prev => {
        const newMap = new Map(prev);
        newMap.set(record.EXTERNAL_ID, results);
        return newMap;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Space size="middle">
      <Button
        type="primary"
        onClick={handleClick}
        disabled={selectedPlatforms.length === 0 || isLoading}
        loading={isLoading}
      >
        Sync Task
      </Button>
    </Space>
  );
}

function SyncStatusTag({ platform, result, isSelected, isLoading }: SyncStatusProps) {
  if (isLoading) {
    return (
      <Tag icon={<LoadingOutlined spin />} color="processing">
        {platform === 'clickup' ? 'CU' : 'WF'}
      </Tag>
    );
  }

  if (!isSelected) {
    return (
      <Tooltip title="Not selected">
        <Tag icon={<MinusCircleOutlined />} color="default">
          {platform === 'clickup' ? 'CU' : 'WF'}
        </Tag>
      </Tooltip>
    );
  }

  if (!result) {
    return <Tag color="default">{platform === 'clickup' ? 'CU' : 'WF'}</Tag>;
  }

  if (result.status === 'success') {
    return (
      <Tooltip title={`ID: ${result.taskId}`}>
        <Tag icon={<CheckCircleOutlined />} color="success">
          {platform === 'clickup' ? 'CU' : 'WF'}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={result.error}>
      <Tag icon={<CloseCircleOutlined />} color="error">
        {platform === 'clickup' ? 'CU' : 'WF'}
      </Tag>
    </Tooltip>
  );
}

export const getColumns = (
  newMqmsTasks: MQMSTask[],
  setMQMSTasks: (tasks: MQMSTask[]) => void,
  listId: string,
  selectedPlatforms: SyncPlatform[],
  syncResults: Map<string, PlatformSyncResult[]>,
  setSyncResults: React.Dispatch<React.SetStateAction<Map<string, PlatformSyncResult[]>>>
): ColumnsType<MQMSTask> => [
  {
    title: 'JOB_NAME',
    dataIndex: 'JOB_NAME',
    key: 'JOB_NAME',
  },
  {
    title: 'EXTERNAL_ID',
    dataIndex: 'EXTERNAL_ID',
    key: 'EXTERNAL_ID',
  },
  {
    title: 'SECONDARY_EXTERNAL_ID',
    dataIndex: 'SECONDARY_EXTERNAL_ID',
    key: 'SECONDARY_EXTERNAL_ID',
  },
  {
    title: 'REQUEST_NAME',
    dataIndex: 'REQUEST_NAME',
    key: 'REQUEST_NAME',
  },
  {
    title: 'PROJECT_TYPE',
    dataIndex: 'PROJECT_TYPE',
    key: 'PROJECT_TYPE',
  },
  {
    title: 'NODE_NAME',
    dataIndex: 'NODE_NAME',
    key: 'NODE_NAME',
  },
  {
    title: 'Status',
    key: 'status',
    width: 120,
    render: (_, record) => {
      const results = syncResults.get(record.EXTERNAL_ID) || [];
      const clickupResult = results.find(r => r.platform === 'clickup');
      const workflowResult = results.find(r => r.platform === 'workflow');

      return (
        <Space size="small">
          <SyncStatusTag
            platform="clickup"
            result={clickupResult}
            isSelected={selectedPlatforms.includes('clickup')}
            isLoading={false}
          />
          <SyncStatusTag
            platform="workflow"
            result={workflowResult}
            isSelected={selectedPlatforms.includes('workflow')}
            isLoading={false}
          />
        </Space>
      );
    },
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <SyncActionButton
        record={record}
        newMqmsTasks={newMqmsTasks}
        setMQMSTasks={setMQMSTasks}
        listId={listId}
        selectedPlatforms={selectedPlatforms}
        setSyncResults={setSyncResults}
      />
    ),
  },
];
