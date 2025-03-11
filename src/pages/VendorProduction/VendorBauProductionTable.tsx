import { Flex, Table } from "antd";
import ProductionReportGenerator from "./ProductionReportGenerator";
import { CustomField, Task, TaskRow } from "../../types/Task";
import { Vendor } from "../../types/Vendor";
import UpdateCheckedForSubcoLabels from "./UpdateCheckedForSubcoLabels";
import { codeMapping, columns } from "./VendorBauProductionTable.config";

interface Props {
  bau: Task[];
  vendor: Vendor;
}

function VendorBauProductionTable({ bau, vendor }: Props) {
  const bauFieldsValues = bau.map((task) => {
    const receivedDate = task?.custom_fields?.find(
      (field) => field.name === "RECEIVED DATE"
    )?.value as string;
    const completionDate = task?.custom_fields?.find(
      (field) => field.name === "ACTUAL COMPLETION DATE"
    )?.value as string;
    const codes = task?.custom_fields?.filter(
      (field) =>
        field.type === "number" &&
        field.value &&
        (field.name?.includes("(EA)") ||
          field.name?.includes("(FT)") ||
          field.name?.includes("(HR)"))
    ) as CustomField[];

    return {
      id: task.id as string,
      name: task.name,
      receivedDate: new Date(Number(receivedDate)).toLocaleDateString(),
      completionDate: new Date(Number(completionDate)).toLocaleDateString(),
      codes,
    };
  });

  const dataSource = bauFieldsValues.reduce((acc: TaskRow[], task) => {
    const row = task?.codes?.map((code) => {
      return {
        id: task.id,
        name: task.name,
        receivedDate: task?.receivedDate,
        completionDate: task?.completionDate,
        quantity: code.value as string,
        projectCode: codeMapping[code.name as string] ?? "invalid code",
        key: crypto.randomUUID(),
      };
    });
    acc.push(...row);
    return acc;
  }, []);

  return (
    <main>
      <h1>Planilla de {vendor.username}</h1>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
      <Flex justify="center" gap="small">
        <ProductionReportGenerator vendor={vendor} tasks={dataSource} />
        <UpdateCheckedForSubcoLabels tasks={dataSource} />
      </Flex>
    </main>
  );
}

export default VendorBauProductionTable;
