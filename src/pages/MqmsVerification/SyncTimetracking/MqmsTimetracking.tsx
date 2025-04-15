import { useMQMSAuth } from '../../../hooks/useMQMSAuth';
import { useMQMSDesignTeam } from '../../../hooks/useMQMSDesignTeam';
import { useMQMSTimetracker } from '../../../hooks/useMQMSTimetracker';
import { extractTaskFields } from '../../../utils/helperFunctions';

import {
  checkMissingWorkRequestID,
  getMQMSTaskTimetrackerWithID,
} from '../../../utils/tasksFunctions';
import { useMemo } from 'react';
import { useCombinedFilteredTasks } from './useCombinedFilteredTasks';
import { useTimetrackingPayloads } from './useTimetrackingPayloads';
import TimetrackingTable from './TimetrackingTable';

const fields = [
  'id',
  'WORK REQUEST ID',
  'assignees',
  'QC PERFORMED BY',
  'PREASBUILT QC BY',
  'DESIGN QC BY',
  'REDESIGN QC BY',
];

function MqmsTimetracking() {
  const { filteredTasks } = useCombinedFilteredTasks();
  const { accessToken } = useMQMSAuth();
  const { userHierarchy } = useMQMSDesignTeam(accessToken);

  const taskIsMissingWorkRequestID = checkMissingWorkRequestID(filteredTasks);

  const tasks = useMemo(() => {
    return filteredTasks.length > 0
      ? filteredTasks.map(task => extractTaskFields(task, fields)).filter(t => t.id === '86b4daf6n')
      : [];
  }, [filteredTasks]);

  const UuidList = useMemo(() => {
    return !taskIsMissingWorkRequestID ? tasks.map(task => task['WORK REQUEST ID'] as string) : [];
  }, [tasks, taskIsMissingWorkRequestID]);

  const idsList = tasks.length > 0 ? tasks.map(task => task.id as string) : [];

  const { MQMSTasksTimetracker } = useMQMSTimetracker(accessToken, UuidList, userHierarchy);

  const MQMSTaskTimetrackerWithID = getMQMSTaskTimetrackerWithID(
    MQMSTasksTimetracker,
    tasks,
    filteredTasks
  );

  const { payloads } = useTimetrackingPayloads(idsList, MQMSTaskTimetrackerWithID, tasks);

  return <div>{<TimetrackingTable payloads={payloads} />}</div>;
}

export default MqmsTimetracking;
