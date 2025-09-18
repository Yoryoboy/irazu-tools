import type { MQMSTask } from '../../../types/Task';

// Central source of truth for MQMS columns we expect from Excel
export const DESIRED_KEYS = [
  'REQUEST_ID',
  'JOB_NAME',
  'EXTERNAL_ID',
  'SECONDARY_EXTERNAL_ID',
  'REQUEST_NAME',
  'PROJECT_TYPE',
  'NODE_NAME',
  'HUB',
] as const satisfies ReadonlyArray<keyof MQMSTask>;

export type DesiredKey = typeof DESIRED_KEYS[number];
