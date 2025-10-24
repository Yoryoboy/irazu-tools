import {
  CreateNewTimeEntryResponse,
  TimetrackingPayload,
} from '../../../types/Task';
import { createNewtimeEntry } from '../../../utils/clickUpApi';
import { sendBatchedRequests } from '../../../utils/helperFunctions';

export function getRowsforMUITable(payloads: TimetrackingPayload[]) {
  // Manual groupBy implementation since Object.groupBy is not available in ES2023
  const groupedPayload: Record<string, TimetrackingPayload[]> = {};
  payloads.forEach((payload) => {
    const key = payload.clickUpID;
    if (!groupedPayload[key]) {
      groupedPayload[key] = [];
    }
    groupedPayload[key].push(payload);
  });

  const testRow = [];

  for (const [clickUpID, values] of Object.entries(groupedPayload)) {
    const designDuration = values?.reduce((acc: number, value) => {
      if ('start' in value && 'stop' in value) {
        const time = value.stop ? value.stop - value.start : 0;
        return acc + (time ?? 0);
      }
      return acc;
    }, 0);

    const qcDuration = values?.reduce((acc: number, value) => {
      if ('duration' in value) {
        const time = value.duration ?? 0;
        return acc + (time ?? 0);
      }
      return acc;
    }, 0);

    testRow.push({
      id: clickUpID,
      clickUpID,
      designDuration: designDuration ? (designDuration / 60 / 60 / 1000).toFixed(2) : '0',
      qcDuration: qcDuration ? (qcDuration / 60 / 60 / 1000).toFixed(2) : '0',
    });
  }

  return testRow;
}

export function handleClick(
  payloads: TimetrackingPayload[],
  setLocalPayloads: React.Dispatch<React.SetStateAction<TimetrackingPayload[]>>
) {
  if (payloads.length > 0) {
    console.log(`Starting to send ${payloads.length} payloads...`);

    sendBatchedRequests<TimetrackingPayload, CreateNewTimeEntryResponse>(
      payloads,
      80,
      createNewtimeEntry
    ).catch(error => {
      console.error('Error sending batched requests:', error);
    });

    setLocalPayloads(prevState => prevState.filter(payload => !payloads.includes(payload)));
  } else {
    console.log('No payloads to send.');
  }
}
