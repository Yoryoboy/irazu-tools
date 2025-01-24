export interface MQMSUser {
  accessToken: string;
  passwordReset?: boolean;
  userId: string;
  defaultView?: null;
  userRole?: string;
  isCompanyRep?: null;
}

export interface MQMSFetchTasksResponse {
  status?: string;
  message?: string;
  data?: MQMSData;
}

export interface MQMSData {
  count?: number;
  results?: Result[];
  aggregation?: unknown[];
}

export interface Result {
  uuid: string;
  job: string;
  jobname: string;
  externalID: string;
  secondaryExternalID: string;
  status: string;
  currentAssignedUser: string;
  module: string;
}

export interface MQMSTasksWithClickUpID extends Result {
  clickUpID: string;
}

export interface FetchUserHierarchyResponse {
  status: string;
  message: string;
  data: Data;
}

export interface Data {
  userHierarchy: UserHierarchy[];
}

export interface UserHierarchy {
  EMP_ID: string;
  USERNAME: string;
  FIRSTNAME: string;
  LASTNAME: string;
  SUPERVISOR_ID: string;
  TWC: number;
  PWC: number;
  OC: number;
  TSC: number;
  CHILDREN: number;
  SUPERVISOR_FLAG: string;
  ROLENAME: string;
  QUOTAPOINT: number;
  CHILDQUOTAPOINT: number;
  PARENTWITHCHILDREN: number;
  CompanyName: string;
}

export interface FetchStartsStopsResponse {
  status: string;
  message: string;
  data: StartsStops[];
}

export interface StartsStops {
  uuid: string;
  createdAt: Date;
  elapseTime: number;
  moduleUUID: string;
  oldStart: Date;
  oldStop: Date;
  start: Date;
  stop: Date;
  userUUID: string;
  moduleToData: ModuleToData[];
  actionByUser: ActionByUser[];
}

export interface ActionByUser {
  firstName: string;
  middleName: string;
  username: string;
  uuid: string;
  lastName: string;
}

export interface ModuleToData {
  uuid: string;
  type: string;
  name: string;
}

export interface TaskTimeData {
  taskUuid: string;
  data: StartsStops[];
}

export interface TaskTimeDataWithClickUpID extends TaskTimeData {
  clickUpID: string;
}
