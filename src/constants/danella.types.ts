export interface CustomField {
  projectSecondaryFieldID: number;
  projectID: number;
  fieldDefinitionID: number;
  fieldName: string;
  deleted: number;
  createDate: string;
  userID: number;
}

export interface DanellaProjectDetails {
  projectID: number;
  asbuiltSubProjectID: number;
  designSubProjectID: number;
  redesignSubProjectID: number;
  customFields: CustomField[];
}
