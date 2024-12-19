import { Table } from "antd";
import { extractTaskFields, unifyProjects } from "../../utils/helperFunctions";
import { asbuiltFields, designFields } from "./VendorProductionTable.config";
import ProductionReportGenerator from "./ProductionReportGenerator";
import { Task } from "../../types/Task";
import { Vendor } from "../../types/Vendor";

interface Props {
  asbuilts: Task[];
  designs: Task[];
  vendor: Vendor;
}

function VendorProductionTable({ asbuilts, designs, vendor }: Props) {
  console.log("task", asbuilts);
  console.log("field values", asbuiltFields);

  const asbuiltFieldsValues = asbuilts.map((asbuilt) => {
    const projectCode: string = "CCI - HS ASBUILT";
    const fieldsValues = extractTaskFields(asbuilt, asbuiltFields);
    return { ...fieldsValues, projectCode };
  });

  console.log("asbuilt fields values", asbuiltFieldsValues);

  const designFieldsValues = designs.map((design) => {
    const projectCode: string = "CCI - HS DESIGN";
    const fieldValues = extractTaskFields(design, designFields);
    return { ...fieldValues, projectCode };
  });

  const unifiedTasks = unifyProjects(asbuiltFieldsValues, designFieldsValues);

  const columns =
    unifiedTasks.length > 0
      ? Object.keys(unifiedTasks[0]).map((key) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1), // Capitalizar título
          dataIndex: key, // Vincula la columna con el campo correspondiente
          key: key,
        }))
      : [];

  const dataSource = unifiedTasks.map((item, index) => ({
    ...item,
    key: `${item.name}-${index}`, // Asegura que cada fila tenga un key único
  }));

  return (
    <main>
      <h1>Planilla de {vendor.username}</h1>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
      <ProductionReportGenerator vendor={vendor} tasks={unifiedTasks} />
    </main>
  );
}

export default VendorProductionTable;
