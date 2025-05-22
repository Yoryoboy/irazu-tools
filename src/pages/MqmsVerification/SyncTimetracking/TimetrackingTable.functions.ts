import { CreateNewTimeEntryResponse, newTimeEntryPayload, TimetrackingPayload } from "../../../types/Task";
import { createNewtimeEntry } from "../../../utils/clickUpApi";
import { sendBatchedRequests } from "../../../utils/helperFunctions";

export function getRowsforMUITable(payloads: TimetrackingPayload[]) {
  const groupedPayload = Object.groupBy(payloads, ({ clickUpID }) => clickUpID);

  const testRow = [];

  for (const [clickUpID, values] of Object.entries(groupedPayload)) {
    const designDuration = values?.reduce((acc, value) => {
      if ('start' in value && 'stop' in value) {
        const time = value.stop ? value.stop - value.start : 0;
        return acc + (time ?? 0);
      }
      return acc;
    }, 0);

    const qcDuration = values?.reduce((acc, value) => {
      if ('duration' in value) {
        const time = value.duration ?? 0;
        return acc + (time ?? 0);
      }
      return acc;
    }, 0);

    testRow.push({
      id: clickUpID,
      clickUpID,
      designDuration: designDuration
        ? (designDuration / 60 / 60 / 1000).toFixed(2)
        : "0",
      qcDuration: qcDuration ? (qcDuration / 60 / 60 / 1000).toFixed(2) : "0",
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
        90,
        createNewtimeEntry
      ).catch((error) => {
        console.error("Error sending batched requests:", error);
      });

    setLocalPayloads((prevState) =>
      prevState.filter((payload) => !payloads.includes(payload))
    );
  } else {
    console.log("No payloads to send.");
  }
}
