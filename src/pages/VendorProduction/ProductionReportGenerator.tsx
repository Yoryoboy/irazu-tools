import { Button } from "antd";
import { Vendor } from "../../types";
import { DownloadOutlined } from "@ant-design/icons";

interface Props {
  vendor: Vendor;
  tasks: unknown[];
}

function ProductionReportGenerator({ vendor, tasks }: Props) {
  console.log(vendor, tasks);
  return (
    <div>
      <Button
        type="primary"
        shape="round"
        icon={<DownloadOutlined />}
        size="large"
      >
        Download
      </Button>
    </div>
  );
}

export default ProductionReportGenerator;
