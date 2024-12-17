import { Table } from "antd";
import { Task } from "../../types";
import { extractTaskFields, unifyProjects } from "../../utils/helperFunctions";
import { asbuiltFields, designFields } from "./VendorProductionTable.config";

interface Props {
  asbuilts: Task[];
  designs: Task[];
}

function VendorProductionTable({ asbuilts, designs }: Props) {
  const asbuiltFieldsValues = asbuilts.map((asbuilt) => {
    const projectCode: string = "CCI - HS ASBUILT";
    const fieldsValues = extractTaskFields(asbuilt, asbuiltFields);
    return { ...fieldsValues, projectCode };
  });
  const designFieldsValues = designs.map((design) => {
    const projectCode: string = "CCI - HS DESIGN";
    const fieldValues = extractTaskFields(design, designFields);
    return { ...fieldValues, projectCode };
  });

  const unifiedTasks = unifyProjects(asbuiltFieldsValues, designFieldsValues);

  const columns = Object.keys(unifiedTasks[0]).map((key) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1), // Capitalizar título
    dataIndex: key, // Vincula la columna con el campo correspondiente
    key: key,
  }));

  const dataSource = unifiedTasks.map((item, index) => ({
    ...item,
    key: `${item.name}-${index}`, // Asegura que cada fila tenga un key único
  }));

  return (
    <main>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </main>
  );
}

export default VendorProductionTable;
