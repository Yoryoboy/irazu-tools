import { Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

interface Props {
  setFile: (file: File) => void;
}

function FileUploader({ setFile }: Props) {
  const props: UploadProps = {
    name: "file",
    id: "excel-upload",
    accept: ".xlsx, .xls",
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>Click to Upload Excel</Button>
    </Upload>
  );
}

export default FileUploader;
