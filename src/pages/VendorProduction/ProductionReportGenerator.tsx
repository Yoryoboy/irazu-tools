import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Vendor } from "../../types/Vendor";

interface Props {
  vendor: Vendor;
  tasks: {
    name: string;
    receivedDate: string;
    completionDate: string;
    quantity: string;
    projectCode: string;
  }[];
}

function ProductionReportGenerator({ vendor, tasks }: Props) {
  const startingRow = 11; // Fila inicial parametrizable

  const handleDownload = async () => {
    try {
      // 1. Cargar el template desde public
      const response = await fetch(`/${vendor.reportTemplatePath}`);
      const buffer = await response.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      // 2. Acceder a la hoja llamada "Invoice"
      const worksheet = workbook.getWorksheet("Invoice");
      if (!worksheet) throw new Error("La hoja 'Invoice' no fue encontrada.");

      // 3. Insertar la fecha en la celda B7
      worksheet.getCell("B7").value = new Date().toLocaleDateString();

      // 4. Llenar datos desde la fila inicial
      tasks.forEach((task, index) => {
        const row = worksheet.getRow(startingRow + index);
        row.getCell(3).value = task.projectCode; // Columna C
        row.getCell(4).value = parseFloat(task.quantity); // Columna D
        row.getCell(6).value = task.receivedDate; // Columna F
        row.getCell(7).value = task.completionDate; // Columna G
        row.getCell(8).value = task.name; // Columna H
        row.commit(); // Confirma los cambios en la fila
      });

      // 5. Exportar el archivo Excel con los cambios
      const bufferOut = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([bufferOut]),
        `Production_Report_${vendor.username}.xlsx`
      );
    } catch (error) {
      console.error("Error generating the Excel file:", error);
    }
  };

  return (
    <div>
      <Button
        type="primary"
        shape="round"
        icon={<DownloadOutlined />}
        size="large"
        onClick={handleDownload}
      >
        Download
      </Button>
    </div>
  );
}

export default ProductionReportGenerator;
