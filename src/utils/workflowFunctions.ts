import { TaskCreateDto } from 'workflow-sdk';
import { MQMSTask, PlatformSyncResult } from '../types/Task';
import { danellaHighSplitDetails } from '../constants/danella';
import { getWorkflowClient, resetWorkflowClient } from './workflowClient';
import { formatString } from './helperFunctions';

export function getProjectTypeFromMQMS(projectTypeString: string): string {
  const [, projectType] = projectTypeString.split(' - ');
  return projectType || '';
}

export function getSubProjectID(projectType: string): number {
  if (projectType === 'REDESIGN') {
    return danellaHighSplitDetails.redesignSubProjectID;
  }
  return danellaHighSplitDetails.asbuiltSubProjectID;
}

export function buildWorkflowTaskPayload(
  mqmsTask: MQMSTask,
  clickUpTaskId?: string
): TaskCreateDto {
  const projectType = getProjectTypeFromMQMS(mqmsTask.PROJECT_TYPE);
  const subProjectID = getSubProjectID(projectType);

  const [plantTypeUnformatted] = mqmsTask.PROJECT_TYPE.split(' - ');
  const plantType = formatString(plantTypeUnformatted);
  const fullProjectType = `${plantType} - ${projectType}`;

  console.log({
    mqmsTask,
    projectType,
    subProjectID,
    plantType,
    fullProjectType,
  });

  return {
    subProjectID,
    jobID: mqmsTask.EXTERNAL_ID,
    verifierKeyID: clickUpTaskId || null,
    estimatedClosingDate: null,
    secondaryFields: [
      { fieldName: 'PROJECT_TYPE', value: fullProjectType },
      { fieldName: 'SECONDARY ID', value: mqmsTask.SECONDARY_EXTERNAL_ID },
      { fieldName: 'WORK REQUEST ID - (Request Id)', value: mqmsTask.REQUEST_ID },
    ],
  };
}

export async function postTaskToWorkflow(
  mqmsTask: MQMSTask,
  clickUpTaskId?: string
): Promise<PlatformSyncResult> {
  try {
    const client = await getWorkflowClient();
    const payload = buildWorkflowTaskPayload(mqmsTask, clickUpTaskId);

    const result = await client.tasks.update(payload);

    return {
      platform: 'workflow',
      status: 'success',
      taskName: mqmsTask.EXTERNAL_ID,
      taskId: result.taskID?.toString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError =
      message.toLowerCase().includes('unauthorized') ||
      message.toLowerCase().includes('401') ||
      message.toLowerCase().includes('token');
    if (isAuthError) {
      resetWorkflowClient();
    }
    return {
      platform: 'workflow',
      status: 'error',
      taskName: mqmsTask.EXTERNAL_ID,
      error: message,
    };
  }
}
