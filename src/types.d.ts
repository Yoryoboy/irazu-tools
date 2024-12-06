export interface ParsedData {
  [key: string]: string | number | null | undefined;
}

export interface MQMSTask {
  REQUEST_ID: string;
  JOB_NAME: string;
  EXTERNAL_ID: string;
  SECONDARY_EXTERNAL_ID: string;
  REQUEST_NAME: string;
  PROJECT_TYPE: string;
}

export interface Clickupdataresponse {
  tasks: Task[];
  last_page: boolean;
}

export interface Task {
  id?: string;
  custom_id?: string;
  custom_item_id?: number;
  name: string;
  text_content?: string;
  description?: string;
  status?: StatusClass;
  orderindex?: string;
  date_created?: string;
  date_updated?: string;
  date_closed?: null | string;
  date_done?: null | string;
  archived?: boolean;
  creator?: Creator;
  assignees?: Creator[];
  group_assignees?: unknown[];
  watchers?: Creator[];
  checklists?: Checklist[];
  tags?: unknown[];
  parent?: null;
  top_level_parent?: null;
  priority?: PriorityClass | null;
  due_date?: null;
  start_date?: null;
  points?: null;
  time_estimate?: null;
  custom_fields?: CustomField[];
  dependencies?: unknown[];
  linked_tasks?: unknown[];
  locations?: Location[];
  team_id?: string;
  url?: string;
  sharing?: Sharing;
  permission_level?: PermissionLevel;
  list?: Folder;
  project?: Folder;
  folder?: Folder;
  space?: Space;
}

export interface Creator {
  id: number;
  username: Username;
  color: CreatorColor;
  initials?: Initials;
  email: Email;
  profilePicture: null | string;
}

export enum CreatorColor {
  D60800 = "#d60800",
  Ff5251 = "#ff5251",
  Ffa727 = "#ffa727",
  The0197A7 = "#0197a7",
  The263238 = "#263238",
  The827718 = "#827718",
}

export enum Email {
  AmarreroIrazutechnologyCOM = "amarrero@irazutechnology.com",
  ClickbotClickupCOM = "clickbot@clickup.com",
  EveronIrazutechnologyCOM = "everon@irazutechnology.com",
  GfernandezIrazutechnologyCOM = "gfernandez@irazutechnology.com",
  JdiazIrazutechnologyCOM = "jdiaz@irazutechnology.com",
  JulietaMartinottiBlTechnologyCOM = "julieta.martinotti@bl-technology.com",
}

export enum Initials {
  Am = "AM",
  C = "C",
  Ef = "EF",
  Ev = "EV",
  Jd = "JD",
  Jm = "JM",
}

export enum Username {
  AnaisMarrero = "Anais Marrero",
  ClickBot = "ClickBot",
  EliasVeron = "Elias Veron",
  EzequielFernandez = "Ezequiel Fernandez",
  JorgeDiaz = "Jorge Diaz",
  JulietaMartinotti = "Julieta Martinotti",
}

export interface Checklist {
  id: string;
  task_id: string;
  name: ChecklistName;
  date_created: string;
  orderindex: number;
  creator: number;
  resolved: number;
  unresolved: number;
  items: Item[];
}

export interface Item {
  id: string;
  name: string;
  orderindex: number;
  assignee: null;
  group_assignee: null;
  resolved: boolean;
  parent: null;
  date_created: string;
  start_date: null;
  start_date_time: null;
  due_date: null;
  due_date_time: null;
  sent_due_date_notif: null;
  children: unknown[];
}

export enum ChecklistName {
  IfJobIsRestore = "IF JOB IS RESTORE:",
  OnJobFinish = "On Job Finish",
  OnJobProgress = "On Job Progress",
  OnJobStart = "On Job Start",
}

export interface CustomField {
  id?: string;
  name?: CustomFieldName;
  type?: CustomFieldType;
  type_config?: TypeConfig;
  date_created?: string;
  hide_from_guests?: boolean;
  required?: boolean;
  value?: Creator[] | number | string;
  value_richtext?: null;
}

export enum CustomFieldName {
  ActualCompletionDate = "ACTUAL COMPLETION DATE",
  BOM = "BOM",
  BaseParcelPrep40383Ft = "BASE/PARCEL PREP / 40383 (FT)",
  BauBillingStatus = "BAU BILLING STATUS",
  CoaxAsbuild27240Ea = "COAX ASBUILD / 27240 (EA)",
  CoaxAsbuiltFootage150027529Ft = "COAX ASBUILT FOOTAGE > 1,500’ / 27529 (FT)",
  CoaxNewBuild150027281Ea = "COAX NEW BUILD < 1,500’ / 27281 (EA)",
  CobroContratista1 = "COBRO CONTRATISTA 1",
  CobroContratistaBau = "COBRO CONTRATISTA BAU",
  CodeWs = "CODE WS",
  EstimatedDeliveryDate = "ESTIMATED DELIVERY DATE",
  FTTHDesign150039548Ea = "FTTH DESIGN 1500’ / 39548 (EA)",
  FechaCertificado = "FECHA CERTIFICADO",
  FechaEntregaAsbuilt = "Fecha Entrega Asbuilt",
  FechaEntregaDiseño = "Fecha Entrega Diseño",
  FechaEstimadaDiseño = "Fecha estimada Diseño",
  FiberAndOrCoaxFootage150027280Ft = "FIBER AND/OR COAX FOOTAGE >1,500’ / 27280 (FT)",
  FiberAsbuild27242Ea = "FIBER ASBUILD / 27242 (EA)",
  FiberAsbuiltFootage150027530Ft = "FIBER ASBUILT FOOTAGE > 1,500’ / 27530 (FT)",
  FiberCoaxNewBuild150027283Ea = "FIBER & COAX NEW BUILD 1,500’ / 27283 (EA)",
  FiberNewBuild150027282Ea = "FIBER NEW BUILD < 1,500’ / 27282 (EA)",
  Hub = "HUB",
  Invoice2 = "INVOICE 2",
  InvoiceWs = "INVOICE WS",
  JorgeChecked = "Jorge Checked",
  NCertificadoWs = "N° CERTIFICADO WS",
  NewCoaxFootageOver1500Ft = "NEW COAX FOOTAGE OVER 1500 (FT)",
  NewFiberFootageOver1500Ft = "NEW FIBER FOOTAGE OVER 1500 (FT)",
  PlantType = "PLANT TYPE",
  PodsCci = "PODS (CCI)",
  Points = "POINTS",
  ProjectType = "PROJECT TYPE",
  QcPerformedBy = "QC PERFORMED BY",
  ReceivedDate = "RECEIVED DATE",
  Redesign13406Hr = "REDESIGN / 13406 (HR)",
  Region = "REGION",
  SecondaryID = "SECONDARY ID",
  ServiceableTciWifi29312Ea = "SERVICEABLE/TCI/WIFI / 29312 (EA)",
  StatusWS = "Status WS",
  Ticket = "TICKET",
}

export enum CustomFieldType {
  Date = "date",
  DropDown = "drop_down",
  Number = "number",
  ShortText = "short_text",
  Users = "users",
}

export interface TypeConfig {
  options?: Option[];
  default?: number;
  placeholder?: null;
  new_drop_down?: boolean;
  sorting?: string;
  single_user?: boolean;
  include_groups?: boolean | null;
  include_guests?: boolean;
  include_team_members?: boolean;
}

export interface Option {
  id?: string;
  name?: string;
  label?: string;
  color?: string | null;
  orderindex?: number;
}

export interface Folder {
  id: string;
  name: FolderName;
  hidden?: boolean;
  access: boolean;
}

export enum FolderName {
  CciBau = "CCI - BAU",
  Projects = "Projects",
}

export interface Location {
  id: string;
  name: LocationName;
}

export enum LocationName {
  CciBauBillingCodes = "CCI - BAU - BILLING CODES",
}

export enum PermissionLevel {
  Create = "create",
}

export interface PriorityClass {
  color: PriorityColor;
  id: string;
  orderindex: string;
  priority: PriorityEnum;
}

export enum PriorityColor {
  F50000 = "#f50000",
}

export enum PriorityEnum {
  Urgent = "urgent",
}

export interface Sharing {
  public: boolean;
  public_share_expires_on: null;
  public_fields: PublicField[];
  token: null;
  seo_optimized: boolean;
}

export enum PublicField {
  Assignees = "assignees",
  Attachments = "attachments",
  Checklists = "checklists",
  Comments = "comments",
  Content = "content",
  Coverimage = "coverimage",
  CustomFields = "customFields",
  DueDate = "due_date",
  Priority = "priority",
  Subtasks = "subtasks",
  Tags = "tags",
}

export interface Space {
  id: string;
}

export interface StatusClass {
  status: StatusEnum;
  id: ID;
  color: StatusColor;
  type: StatusType;
  orderindex: number;
}

export enum StatusColor {
  Aa8D80 = "#aa8d80",
  D33D44 = "#d33d44",
  The008844 = "#008844",
  The1090E0 = "#1090e0",
  The5F55Ee = "#5f55ee",
  The656F7D = "#656f7d",
}

export enum ID {
  Sc9014047302641CGZyujB = "sc901404730264_1cgZyujB",
  Sc9014047302645B3Vnk9U = "sc901404730264_5b3vnk9u",
  Sc9014047302646FsxTOBD = "sc901404730264_6FsxTOBD",
  Sc901404730264CjDAdIF9 = "sc901404730264_CjDAdIF9",
  Sc901404730264L8Y91Y6B = "sc901404730264_L8y91Y6B",
  Sc901404730264SJwjhrAC = "sc901404730264_SJwjhrAc",
  Sc901404730264YW0Icxg1 = "sc901404730264_YW0icxg1",
}

export enum StatusEnum {
  Approved = "approved",
  AsbuiltInProgress = "asbuilt in progress",
  AsbuiltReadyForQc = "asbuilt ready for qc",
  AsbuiltSent = "asbuilt sent",
  Cancelled = "cancelled",
  DesignSent = "design sent",
  OnHold = "on hold",
}

export enum StatusType {
  Closed = "closed",
  Custom = "custom",
  Done = "done",
}

// Custom Fields Types

export interface CustomFields {
  fields: Field[];
}

export interface Field {
  id: string;
  name: string;
  type: Type;
  type_config: TypeConfig;
  date_created: string;
  hide_from_guests: boolean;
  required: boolean;
}

export type Type =
  | "date"
  | "drop_down"
  | "number"
  | "short_text"
  | "users"
  | "labels";

export interface NewCustomFieldObject {
  id: string;
  value: string | undfined;
}

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

export type PostNewTaskResult =
  | FulfilledPostNewTaskResult
  | RejectedPostNewTaskResult;

export interface UseFilteredClickUpTasksProps {
  teamId: string;
  queryParams: Record<string, string>;
}

export interface UseFilteredClickUpTasksReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface Members {
  user?: User;
  invited_by?: InvitedBy;
  can_see_time_spent?: boolean;
  can_see_time_estimated?: boolean;
  can_see_points_estimated?: boolean;
  can_edit_tags?: boolean;
  can_create_views?: boolean;
}

export interface InvitedBy {
  id?: number;
  username?: string;
  color?: string;
  email?: string;
  initials?: string;
  profilePicture?: null;
  banned_date?: null;
  status?: string;
}

export interface User {
  id?: number;
  username?: null | string;
  email?: string;
  color?: null | string;
  profilePicture?: null | string;
  initials?: string;
  role?: number;
  custom_role?: null;
  last_active?: null | string;
  date_joined?: null | string;
  date_invited?: string;
}
