import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { newTimeEntryPayload } from "../../../types/Task";
import { useEffect, useState } from "react";
import { getRowsforMUITable, handleClick } from "./TimetrackingTable.functions";
import { Button, Flex, Statistic } from "antd";

interface Props {
  payloads: newTimeEntryPayload[];
}

const columns: GridColDef[] = [
  { field: "clickUpID", headerName: "ClickUpID", width: 150 },
  { field: "designDuration", headerName: " Design Duration", width: 150 },
  { field: "qcDuration", headerName: " QC Duration", width: 150 },
];

function TimetrackingTable({ payloads }: Props) {
  console.log(payloads);
  const [localPayloads, setLocalPayloads] = useState<newTimeEntryPayload[]>([]);
  const rows = getRowsforMUITable(localPayloads);

  useEffect(() => {
    if (payloads.length > 0) {
      setLocalPayloads(payloads); // Almacena los datos una vez que el hook los obtiene
    }
  }, [payloads]);

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const selectedPayloads =
    rowSelectionModel.length > 0
      ? localPayloads.filter((payload) =>
          rowSelectionModel.includes(payload.clickUpID)
        )
      : [];

  return (
    <section>
      <Flex align="center" justify="space-between" style={{ marginTop: 50 }}>
        <Statistic title="Tareas" value={rows.length} />
        <Statistic title="Payloads en total" value={localPayloads.length} />
        <Statistic
          title="Payloads seleccionados"
          value={selectedPayloads.length}
        />
      </Flex>

      <Button
        type="primary"
        onClick={() => handleClick(selectedPayloads, setLocalPayloads)}
      >
        Sincronizar tareas seleccionadas
      </Button>

      <article>
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
      </article>
    </section>
  );
}

export default TimetrackingTable;
