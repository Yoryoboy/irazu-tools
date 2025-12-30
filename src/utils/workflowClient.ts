import { DanellaSDK } from 'workflowSDK/src/index';

const WORKFLOW_API_KEY = import.meta.env.VITE_WORKFLOW_API_KEY;
const USER_ID = import.meta.env.VITE_WORKFLOW_USER_ID;
const EMPLOYEE_ID = import.meta.env.VITE_WORKFLOW_EMPLOYEE_ID;
const NAME = import.meta.env.VITE_WORKFLOW_NAME;

let workflowClientInstance: DanellaSDK | null = null;
let isAuthenticated = false;

export async function getWorkflowClient(): Promise<DanellaSDK> {
  if (!workflowClientInstance) {
    workflowClientInstance = new DanellaSDK({
      apiKey: WORKFLOW_API_KEY,
      userId: parseInt(USER_ID),
      employeeId: parseInt(EMPLOYEE_ID),
      name: NAME,
    });
  }

  if (!isAuthenticated) {
    await workflowClientInstance.auth.login();
    isAuthenticated = true;
  }

  return workflowClientInstance;
}

export function resetWorkflowClient(): void {
  if (workflowClientInstance) {
    workflowClientInstance.auth.logout();
  }
  workflowClientInstance = null;
  isAuthenticated = false;
}
