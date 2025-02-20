import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { newTimeEntryPayload } from "../../../types/Task";
import test from "node:test";

interface Props {
  payloads: newTimeEntryPayload[];
}

function getRowsforMUITable(payloads: newTimeEntryPayload[]) {
  const groupedPayload = Object.groupBy(payloads, ({ clickUpID }) => clickUpID);
  console.log(groupedPayload);

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

function TimetrackingTable({ payloads }: Props) {
  const rows = getRowsforMUITable(payloads);
  console.log("rows :", rows);
  const columns: GridColDef[] = [
    { field: "clickUpID", headerName: "ClickUpID", width: 150 },
    { field: "designDuration", headerName: " Design Duration", width: 150 },
    { field: "qcDuration", headerName: " QC Duration", width: 150 },
  ];

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      rowCount={rows?.length ?? 0}
      paginationMode="server"
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5,
          },
        },
      }}
      pageSizeOptions={[5]}
      checkboxSelection
      disableRowSelectionOnClick
    />
  );
}

export default TimetrackingTable;
