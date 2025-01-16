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
  currentAssignedUser?: string;
  currentAssignedUsername?: string;
  company?: string;
  module?: string;
  plantProjectJobType?: string;
  lobUUID?: string;
  softwareUUID?: string;
  plantProjectJobTypeUUID?: string;
  priority?: string;
  origin?: string;
  groupPoints?: number;
  previousWorkRequestModuleCompany?: string;
  city?: string;
  icon?: string[];
  legacyDivision?: string;
  rejectReason?: string;
  rejectDate?: null;
  p_qc?: string;
  prism_QC?: number;
  escalationAssignee?: string;
  previousCompanyUUID?: string;
  previousWorkRequestCompany?: string;
  previousWorkRequestUser?: string;
  previousWorkRequestModuleUser?: string;
  proximityGroupId?: null;
  hubName?: string;
  nodeName?: string;
  rejectTime?: number;
  currentAssignedUUID?: string;
  currentAssignedModuleUUID?: string;
  marketProfileUUID?: string;
  coordinatorUUID?: string;
  partialFlag?: boolean;
}

export interface ClosedAndPreclosedTasksWithClickUpID extends Result {
  clickUpID: string;
}
