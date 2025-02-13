export interface MQMSUser {
  accessToken: string;
  passwordReset?: boolean;
  userId: string;
  defaultView?: null;
  userRole?: string;
  isCompanyRep?: null;
}

export interface FetchMQMSTaskByUuidResponse {
  status: string;
  message: string;
  data: TaskDatum[];
}

export interface TaskDatum {
  uuid: string;
  workRequestName: string;
  externalID: string;
  secondaryExternalID: string;
  plantProjectJobTypeUUID: string;
  receivedDate: Date;
  etaDate: Date;
  slaDate: Date;
  nodeName: string;
  hubName: string;
  flagged: boolean;
  rejectModuleUUID: string;
  isActive: boolean;
  softwareUUID: string;
  totalPoints: number;
  nodeFlag: boolean;
  escalationFlag: boolean;
  slaFlag: boolean;
  rejectApproval: boolean;
  pointsRolledOver: boolean;
  pointsUpdated: boolean;
  createdBy: Coordinator;
  prism_QC: number;
  createdAt: Date;
  numberOfFile: number;
  address: Address;
  projectUserFieldValues: ProjectUserFieldValue[];
  workFlows: WorkFlow[];
  status: JobTypeUUID;
  escalationAssignee: string;
  rejectAssignTo: string;
  ouRegionMarket: OuRegionMarket;
  jobName: string;
  nodeFlagObject: unknown;
  marketProfileUUID: string;
  plantTypeUUID: JobTypeUUID;
  projectTypeUUID: JobTypeUUID;
  jobTypeUUID: JobTypeUUID;
  coordinator: Coordinator;
  priority: string;
  lobUUID: string;
  lobName: string;
  softwareName: string;
  currentAssignedModule: unknown;
  currentAssignedUser: CurrentAssignedUser;
  prismURL: string;
  isActivePrismUrl: boolean;
  assignedDate: null;
}

export interface Address {
  uuid: string;
  city: string;
  county: string;
  state: string;
  streetName: string;
  streetSuffix: string;
  zipCode: string;
  zipCodeAddOn: string;
  location: Location;
}

export interface Location {
  type: string;
  coordinates: number[];
}

export interface Coordinator {
  uuid: string;
  firstName: string;
  lastName: string;
  username: string;
  name?: string;
  middleName?: string;
}

export interface CurrentAssignedUser {
  middleName: string;
}

export interface JobTypeUUID {
  name: string;
  uuid: string;
}

export interface OuRegionMarket {
  uuid: string;
  isAssigned: boolean;
  ou: JobTypeUUID;
  region: JobTypeUUID;
  market: JobTypeUUID;
}

export interface ProjectUserFieldValue {
  projectUserFieldUUID: string;
  value: string;
  uuid: string;
}

export interface WorkFlow {
  assignedUserUUID: string;
  moduleUUID: string;
  moduleGroupUUID: string;
  flowOrderNum: number;
  moduleWeightage: number;
  completed: boolean;
  moduleObj: JobTypeUUID;
  createdByObj: Coordinator;
  assignedUser: Coordinator;
}

export interface FetchMQMSTaskByNameResponse {
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
