import { Flex, Table } from "antd";
import ProductionReportGenerator from "./ProductionReportGenerator";
import { Task } from "../../types/Task";
import { Vendor } from "../../types/Vendor";
import UpdateCheckedForSubcoLabels from "./UpdateCheckedForSubcoLabels";
import { idID } from "@mui/material/locale";

interface Props {
  bau: Task[];
  vendor: Vendor;
}

function VendorBauProductionTable({ bau, vendor }: Props) {
  const bauFieldsValues = bau.map((task) => {
    const receivedDate = task?.custom_fields?.find(
      (field) => field.name === "RECEIVED DATE"
    )?.value;
    const completionDate = task?.custom_fields?.find(
      (field) => field.name === "ACTUAL COMPLETION DATE"
    )?.value;
    const codes = task?.custom_fields?.filter(
      (field) =>
        field.type === "number" &&
        field.value &&
        (field.name?.includes("(EA)") ||
          field.name?.includes("(FT)") ||
          field.name?.includes("(HR)"))
    );

    return {
      id: task.id,
      name: task.name,
      receivedDate,
      completionDate,
      codes,
    };
  });

  console.log(bauFieldsValues);

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ReceivedDate",
      dataIndex: "receivedDate",
      key: "receivedDate",
    },
    {
      title: "CompletionDate",
      dataIndex: "completionDate",
      key: "completionDate",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "ProjectCode",
      dataIndex: "projectCode",
      key: "projectCode",
    },
  ];

  // const dataSource = unifiedTasks.map((item, index) => ({
  //   ...item,
  //   key: `${item.name}-${index}`, // Asegura que cada fila tenga un key único
  // }));

  return (
    <main>
      {/* <h1>Planilla de {vendor.username}</h1>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
      <Flex justify="center" gap="small">
        <ProductionReportGenerator vendor={vendor} tasks={unifiedTasks} />
        <UpdateCheckedForSubcoLabels tasks={unifiedTasks} />
      </Flex> */}
    </main>
  );
}

export default VendorBauProductionTable;
