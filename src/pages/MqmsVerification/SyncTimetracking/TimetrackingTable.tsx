import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { newTimeEntryPayload } from "../../../types/Task";
import { useState } from "react";
import { getRowsforMUITable } from "./TimetrackingTable.functions";

interface Props {
  payloads: newTimeEntryPayload[];
}

const columns: GridColDef[] = [
  { field: "clickUpID", headerName: "ClickUpID", width: 150 },
  { field: "designDuration", headerName: " Design Duration", width: 150 },
  { field: "qcDuration", headerName: " QC Duration", width: 150 },
];

function TimetrackingTable({ payloads }: Props) {
  const rows = getRowsforMUITable(payloads);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const selectedPayloads =
    rowSelectionModel.length > 0
      ? payloads.filter((payload) =>
          rowSelectionModel.includes(payload.clickUpID)
        )
      : [];

  console.log("selectedPayloads :", selectedPayloads);
  console.log("rows :", rows);
  console.log("payloads :", payloads);

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      rowCount={rows?.length ?? 0}
      paginationMode="server"
      onRowSelectionModelChange={(newRowSelectionModel) => {
        setRowSelectionModel(newRowSelectionModel);
      }}
      rowSelectionModel={rowSelectionModel}
      checkboxSelection
      disableRowSelectionOnClick
    />
  );
}

export default TimetrackingTable;
