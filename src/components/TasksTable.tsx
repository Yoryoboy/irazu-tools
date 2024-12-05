import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MQMSTask } from "../types";

interface Props {
  data: MQMSTask[];
  renderAdditionalColumns?: (row: MQMSTask) => JSX.Element;
}

function TasksTable({ data, renderAdditionalColumns }: Props) {
  // Definir las columnas de la tabla
  const columns: ColumnsType<MQMSTask> = [
    {
      title: "JOB_NAME",
      dataIndex: "JOB_NAME",
      key: "JOB_NAME",
    },
    {
      title: "EXTERNAL_ID",
      dataIndex: "EXTERNAL_ID",
      key: "EXTERNAL_ID",
    },
    {
      title: "SECONDARY_EXTERNAL_ID",
      dataIndex: "SECONDARY_EXTERNAL_ID",
      key: "SECONDARY_EXTERNAL_ID",
    },
    {
      title: "REQUEST_NAME",
      dataIndex: "REQUEST_NAME",
      key: "REQUEST_NAME",
    },
    {
      title: "PROJECT_TYPE",
      dataIndex: "PROJECT_TYPE",
      key: "PROJECT_TYPE",
    },
  ];

  // Agregar columna adicional si existe renderAdditionalColumns
  if (renderAdditionalColumns) {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_, record) => renderAdditionalColumns(record),
    });
  }

  // Añadir clave única a cada fila
  const dataSource = data.map((row) => ({
    ...row,
    key: row.EXTERNAL_ID, // Usar EXTERNAL_ID como clave única
  }));

  return (
    <Table<MQMSTask>
      columns={columns}
      dataSource={dataSource}
      pagination={false} // Opcional: control de paginación
    />
  );
}

export default TasksTable;
