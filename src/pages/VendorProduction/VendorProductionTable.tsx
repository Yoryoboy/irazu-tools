import { Table } from "antd";
import { Task, Vendor } from "../../types";
import { extractTaskFields, unifyProjects } from "../../utils/helperFunctions";
import { asbuiltFields, designFields } from "./VendorProductionTable.config";
import ProductionReportGenerator from "./ProductionReportGenerator";

interface Props {
  asbuilts: Task[];
  designs: Task[];
  vendor: Vendor;
}

function VendorProductionTable({ asbuilts, designs, vendor }: Props) {
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