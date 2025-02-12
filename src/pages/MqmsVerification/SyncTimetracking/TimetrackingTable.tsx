import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { newTimeEntryPayload } from "../../../types/Task";

interface Props {
  payloads: newTimeEntryPayload[];
}

function getRowsforMUITable(payloads: newTimeEntryPayload[]) {
  const groupedPayload = Object.groupBy(payloads, ({ clickUpID }) => clickUpID);
  console.log(groupedPayload);

  const testRow = [];

  for (const [clickUpID, values] of Object.entries(groupedPayload)) {
    const duration = values?.reduce((acc, value) => {
      const time = value.stop ? value.stop - value.start : value.duration;
      return acc + (time ?? 0);
    }, 0);

    if (duration) {
      testRow.push({
        clickUpID,
        duration: (duration / 60 / 60 / 1000).toFixed(2),
      });
    }
  }
}

function TimetrackingTable({ payloads }: Props) {
  const rows = getRowsforMUITable(payloads);
  const columns: GridColDef[] = [
    { field: "clickUpID", headerName: "ClickUpID", width: 150 },
    { field: "duration", headerName: "Duration", width: 150 },
    { field: "tag", headerName: "Tag", width: 150 },
  ];

  //   const rows: GridRowsProp = [
  //     { id: 1, col1: "Hello", col2: "World" },
  //     { id: 2, col1: "DataGridPro", col2: "is Awesome" },
  //     { id: 3, col1: "MUI", col2: "is Amazing" },
  //   ];
  return (
    <DataGrid
      rows={rows ?? []}
      columns={columns}
      rowCount={1}
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
