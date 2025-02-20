import { newTimeEntryPayload } from "../../../types/Task";

export function getRowsforMUITable(payloads: newTimeEntryPayload[]) {
  const groupedPayload = Object.groupBy(payloads, ({ clickUpID }) => clickUpID);

  const testRow = [];

  for (const [clickUpID, values] of Object.entries(groupedPayload)) {
    const designDuration = values?.reduce((acc, value) => {
      const time = value.stop ? value.stop - value.start : 0;
      return acc + (time ?? 0);
    }, 0);

    const qcDuration = values?.reduce((acc, value) => {
      const time = value.duration ?? 0;
      return acc + (time ?? 0);
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
