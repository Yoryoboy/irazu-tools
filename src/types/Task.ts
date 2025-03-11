export interface Tasks {
  tasks?: Task[];
  last_page?: boolean;
}

export interface Task {
  id?: string;
  custom_id?: string;
  custom_item_id?: number;
  name: string;
  text_content?: string;
  description?: string;
  status?: Status;
  orderindex?: string;
  date_created?: string;
  date_updated?: string;
  date_closed?: null;
  date_done?: null | string;
  archived?: boolean;
  creator?: User;
  assignees?: User[];
  group_assignees?: unknown[];
  watchers?: User[];
  checklists?: unknown[];
  tags?: unknown[];
  parent?: null;
  top_level_parent?: null;
  priority?: Priority;
  due_date?: null;
  start_date?: null;
  points?: null;
  time_estimate?: null;
  time_spent?: number;
  custom_fields?: CustomField[];
  dependencies?: unknown[];
  linked_tasks?: LinkedTask[];
  locations?: Location[];
  team_id?: string;
  url?: string;
  sharing?: Sharing;
  permission_level?: string;
  list?: Folder;
  project?: Folder;
  folder?: Folder;
  space?: Space;
}

export interface Status {
  status?: string;
  id?: string;
  color?: string;
  type?: string;
  orderindex?: number;
}

export interface User {
  id?: number;
  username?: string | null;
  color?: string | null;
  initials?: string;
  last_active?: string | null;
  date_joined?: string | null;
  date_invited?: string | null;
  role?: number;
  banned_date?: null;
  custom_role?: null;
  email?: string;
  profilePicture?: string | null;
  status?: string;
}

export interface Priority {
  color?: string;
  id?: string;
  orderindex?: string;
  priority?: string;
}

export interface CustomField {
  id?: string;
  name?: string;
  type?: string;
  type_config?: TypeConfig;
  date_created?: string;
  hide_from_guests?: boolean;
  value?: User[] | number | string | null;
  value_richtext?: null;
  required?: boolean;
}

export interface TypeConfig {
  default?: number;
  placeholder?: null;
  new_drop_down?: boolean;
  options?: Option[];
  simple?: boolean;
  formula?: string;
  version?: string;
  reset_at?: number;
  is_dynamic?: boolean;
  return_types?: string[];
  calculation_state?: string;
  single_user?: boolean;
  include_groups?: boolean | null;
  include_guests?: boolean;
  include_team_members?: boolean;
  sorting?: string;
}

export interface Option {
  id?: string;
  name?: string;
  color?: string | null;
  orderindex?: number;
  label?: string;
}

export interface LinkedTask {
  task_id?: string;
  link_id?: string;
  date_created?: string;
  userid?: string;
  workspace_id?: string;
}

export interface Sharing {
  public?: boolean;
  public_share_expires_on?: null;
  public_fields?: string[];
  token?: null;
  seo_optimized?: boolean;
}

export interface Folder {
  id?: string;
  name?: string;
  hidden?: boolean;
  access?: boolean;
}

export interface Space {
  id?: string;
}

export interface NewCustomFieldObject {
  id: string;
  value: string;
}

export interface ExtractedTaskFieldValues {
  [key: string]: unknown;
}

export interface UnifiedProject {
  id: string;
  name: string;
  receivedDate: string;
  completionDate: string;
  quantity: string;
  projectCode: string;
}

export interface MQMSTask {
  REQUEST_ID: string;
  JOB_NAME: string;
  EXTERNAL_ID: string;
  SECONDARY_EXTERNAL_ID: string;
  REQUEST_NAME: string;
  PROJECT_TYPE: string;
  NODE_NAME: string;
  HUB: string;
}

export type PostNewTaskResult =
  | FulfilledPostNewTaskResult
  | RejectedPostNewTaskResult;

export interface FulfilledPostNewTaskResult {
  status: "fulfilled";
  value: {
    taskName: string;
    status: "success";
    clickUpTaskId: string;
  };
}

export interface RejectedPostNewTaskResult {
  status: "rejected";
  reason: string;
}

export interface ParsedData {
  [key: string]: string | number | null | undefined;
}

export interface newTimeEntryPayload {
  clickUpID: string;
  assignee: number;
  start: number;
  stop?: number;
  duration?: number;
  tags?: Tag[];
  status?: string;
}

export interface Tag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

export interface CreateNewTimeEntryData {
  data: Data;
}

export interface Data {
  id: string;
  task: Task;
  wid: string;
  user: User;
  billable: boolean;
  start: number;
  end: number;
  duration: number;
  description: string;
  tags: string[];
  at: number;
  is_locked: boolean;
  task_location: unknown;
}

export interface CreateNewTimeEntryResponse {
  status: string;
  data?: CreateNewTimeEntryData;
  message?: string;
}

export interface FecthBulkTasksTimeStatusResponse {
  [task_id: string]: {
    current_status: CurrentStatus;
    status_history: StatusHistory[];
  };
}

export interface BulkTasksTimeStatus {
  task_id: string;
  current_status: CurrentStatus;
  status_history: StatusHistory[];
}

export interface CurrentStatus {
  status: string;
  color: string;
  total_time: TotalTime;
}

export interface TotalTime {
  by_minute: number;
  since: string;
}

export interface StatusHistory {
  status: string;
  color: string;
  type: string;
  total_time: TotalTime;
  orderindex?: number;
}

export interface CheckedSubcoBillingStatusPayloads {
  taskId: string;
  customFieldId: string;
  value: boolean;
}

export interface TaskRow {
  id: string;
  name: string;
  receivedDate: string;
  completionDate: string;
  quantity: string;
  projectCode: string;
  key?: `${string}-${string}-${string}-${string}-${string}`;
}
