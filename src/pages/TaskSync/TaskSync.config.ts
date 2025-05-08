import { MQMSTask } from "@/types/Task";

export const DESIRED_KEYS: (keyof MQMSTask)[] = [
  'REQUEST_ID',
  'JOB_NAME',
  'EXTERNAL_ID',
  'SECONDARY_EXTERNAL_ID',
  'REQUEST_NAME',
  'PROJECT_TYPE',
  'NODE_NAME',
  'HUB',
  'MASTER PROJECT NAME'
];

export const DEFAULT_SEARCH_PARAMS = {};