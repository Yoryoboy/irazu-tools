import ClickUp, { Task as SdkTask } from '@yoryoboy/clickup-sdk';
import { CLICKUP_API_AKEY } from '../utils/config';

// Adapter to isolate our app from SDK specifics and enforce strict typing
export interface CreateTaskPayload {
  name: string;
  description?: string;
  assignees?: number[];
  tags?: string[];
  status?: string;
  priority?: 1 | 2 | 3 | 4 | null;
  due_date?: number;
  start_date?: number;
  custom_fields?: Array<{ id: string; value: string }>;
}

export interface BatchOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  verbose?: boolean;
}

class ClickUpClient {
  private client: InstanceType<typeof ClickUp>;

  constructor(apiKey: string) {
    this.client = new ClickUp(apiKey);
  }

  async getListTasks(listId: string): Promise<SdkTask[]> {
    // Returns SDK Task instances; callers can reduceInfo() if needed
    return this.client.tasks.getTasks({ list_id: listId, page: 'all', include_closed: true });
  }

  async createTasks(
    listId: string,
    tasks: CreateTaskPayload[],
    options?: BatchOptions
  ): Promise<SdkTask[]> {
    return this.client.tasks.createTasks(listId, tasks, {
      batchSize: options?.batchSize ?? 100,
      delayBetweenBatches: options?.delayBetweenBatches ?? 60000,
      verbose: options?.verbose ?? false,
    });
  }
}

// Normalize VITE_CLICKUP_API_AKEY which might be provided like "Bearer <token>"
const rawKey = (CLICKUP_API_AKEY as string) || '';
const normalizedKey = rawKey.replace(/^Bearer\s+/i, '');
export const clickUpClient = new ClickUpClient(normalizedKey);
