import { Flex, Table } from "antd";
import ProductionReportGenerator from "./ProductionReportGenerator";
import { CustomField, Task } from "../../types/Task";
import { Vendor } from "../../types/Vendor";
import UpdateCheckedForSubcoLabels from "./UpdateCheckedForSubcoLabels";

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
      title: "ProjectCode",
      dataIndex: "projectCode",
      key: "projectCode",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
  ];

  interface TaskRow {
    id: string;
    name: string;
    receivedDate: string;
    completionDate: string;
    quantity: string;
    projectCode: string;
    key?: `${string}-${string}-${string}-${string}-${string}`;
  }

  const codeMapping: Record<string, string> = {
    "COAX ASBUILD / 27240 (EA)": "CCI - BAU Coax Asbuild/27240",
    "COAX ASBUILT FOOTAGE > 1,500’ / 27529 (FT)":
      "CCI - BAU Coax Asbuilt Footage > 1,500’/27529",
    "FIBER ASBUILD / 27242 (EA)": "CCI - BAU Fiber Asbuild/27242",
    "FIBER ASBUILT FOOTAGE > 1,500’ / 27530 (FT)":
      "CCI - BAU Fiber Asbuilt Footage > 1,500’/27530",
    "COAX NEW BUILD < 1,500’ / 27281 (EA)":
      "CCI - BAU Coax New Build 1,500’/27281",
    "NEW COAX FOOTAGE OVER 1500 (FT)":
      "CCI - BAU Fiber and/or Coax Footage > 1,500’/27280",
    "FIBER NEW BUILD < 1,500’ / 27282 (EA)":
      "CCI - BAU Fiber New Build  1,500’/27282",
  };

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
      {/* <Flex justify="center" gap="small">
        <ProductionReportGenerator vendor={vendor} tasks={unifiedTasks} />
        <UpdateCheckedForSubcoLabels tasks={unifiedTasks} />
      </Flex> */}
    </main>
  );
}

export default VendorBauProductionTable;
