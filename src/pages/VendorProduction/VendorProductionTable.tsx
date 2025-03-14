import { Flex, Table } from "antd";
import { extractTaskFields, unifyProjects } from "../../utils/helperFunctions";
import {
  asbuiltFields,
  designFields,
  redesignFields,
} from "./VendorProductionTable.config";
import ProductionReportGenerator from "./ProductionReportGenerator";
import { Task } from "../../types/Task";
import { Vendor } from "../../types/Vendor";
import UpdateCheckedForSubcoLabels from "./UpdateCheckedForSubcoLabels";

interface Props {
  asbuilts: Task[];
  designs: Task[];
  redesigns: Task[];
  vendor: Vendor;
}

function VendorProductionTable({
  asbuilts,
  designs,
  redesigns,
  vendor,
}: Props) {
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

  const redesignFieldsValues = redesigns.map((redesign) => {
    const projectCode: string = "CCI - REDESIGN";
    const fieldValues = extractTaskFields(redesign, redesignFields);
    return { ...fieldValues, projectCode };
  });

  const unifiedTasks = unifyProjects(
    asbuiltFieldsValues,
    designFieldsValues,
    redesignFieldsValues
  );

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
      <Flex justify="center" gap="small">
        <ProductionReportGenerator vendor={vendor} tasks={unifiedTasks} />
        <UpdateCheckedForSubcoLabels tasks={unifiedTasks} />
      </Flex>
    </main>
  );
}

export default VendorProductionTable;
