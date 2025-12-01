import { Flex, Table, Collapse, Typography, Space, Badge } from "antd";
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

  const items = [
    {
      key: "1",
      label: (
        <Flex justify="space-between" align="center" style={{ width: "100%" }}>
          <Typography.Text strong>
            Planilla de {vendor.username}
          </Typography.Text>
          <Badge count={unifiedTasks.length} showZero color="#108ee9" />
        </Flex>
      ),
      children: (
        <Table dataSource={dataSource} columns={columns} pagination={false} />
      ),
      extra: (
        <Space
          onClick={(event: React.MouseEvent) => {
            // If you don't want click extra trigger collapse, you can stop propagation:
            event.stopPropagation();
          }}
        >
          <ProductionReportGenerator vendor={vendor} tasks={unifiedTasks} />
          <UpdateCheckedForSubcoLabels tasks={unifiedTasks} />
        </Space>
      ),
    },
  ];

  return (
    <main style={{ marginBottom: "1rem" }}>
      <Collapse items={items} />
    </main>
  );
}

export default VendorProductionTable;
