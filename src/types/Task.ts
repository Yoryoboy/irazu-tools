export interface Tasks {
  tasks?: Task[];
  last_page?: boolean;
}

export interface Task {
  id?: string;
  custom_id?: string;
  custom_item_id?: number;
  name?: string;
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
  username?: string;
  color?: string;
  initials?: string;
  email?: string;
  profilePicture?: string | null;
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
  value?: User[] | number | string;
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
