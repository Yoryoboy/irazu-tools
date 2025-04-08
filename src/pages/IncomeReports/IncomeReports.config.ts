import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { BauIncomeData } from '../../types/Task';

export const bauPrices = {
  'COAX ASBUILD / 27240 (EA)': 20.0,
  'COAX ASBUILT FOOTAGE > 1,500’ / 27529 (FT)': 0.0025,
  'FIBER ASBUILD / 27242 (EA)': 25.0,
  'FIBER ASBUILT FOOTAGE > 1,500’ / 27530 (FT)': 0.0025,
  'COAX NEW BUILD < 1,500’ / 27281 (EA)': 75.0,
  'NEW COAX FOOTAGE OVER 1500 (FT)': 0.02,
  'FIBER AND/OR COAX FOOTAGE >1,500’ / 27280 (FT)': 0.0025,
  'FIBER NEW BUILD < 1,500’ / 27282 (EA)': 150.0,
  'NEW FIBER FOOTAGE OVER 1500 (FT)': 0.02,
  'RDOF Architecture / 40555 (MILE)': 125.0,
  'NODE SPLIT PRELIM / 35539 (EA)': 55.0,
  'SUBCO ONLY Node Seg/Split Asbuild / 35473 (EA)': 125.0,
  'SERVICEABLE/TCI/WIFI / 29312 (EA)': 20.0,
};

export function generateBauIncomeExcel(bauIncomeData: BauIncomeData[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Income', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // Define columns with proper widths and styles
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 15 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Designers', key: 'designers', width: 30 },
    { header: 'Received Date', key: 'receivedDate', width: 15 },
    { header: 'Completion Date', key: 'completionDate', width: 15 },
    { header: 'Code', key: 'code', width: 15 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Total', key: 'total', width: 15 },
  ];

  // Add data rows
  bauIncomeData.forEach(row => {
    worksheet.addRow({
      id: row.id,
      name: row.name,
      designers: row.designers,
      receivedDate: row.receivedDate,
      completionDate: row.completionDate,
      code: row.code,
      quantity: row.quantity,
      price: row.price,
      total: row.total,
    });
  });

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4B5563' },
  };

  // Format number columns
  worksheet.getColumn('price').numFmt = '"$"#,##0.00';
  worksheet.getColumn('total').numFmt = '"$"#,##0.00';
  worksheet.getColumn('quantity').numFmt = '#,##0';

  // Format date columns and ensure they're recognized as dates
  worksheet.getColumn('receivedDate').numFmt = 'yyyy-mm-dd';
  worksheet.getColumn('completionDate').numFmt = 'yyyy-mm-dd';

  // Ensure Excel recognizes dates properly
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      // Skip header row
      const receivedDateCell = row.getCell('receivedDate');
      const completionDateCell = row.getCell('completionDate');

      if (receivedDateCell.value) {
        receivedDateCell.numFmt = 'dd/mm/yyyy';
      }
      if (completionDateCell.value) {
        completionDateCell.numFmt = 'dd/mm/yyyy';
      }
    }
  });

  // Add borders to all cells
  worksheet.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Auto-filter for all columns
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 8 },
  };

  workbook.xlsx.writeBuffer().then(data => {
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `Income_BAU_${new Date().toLocaleDateString()}.xlsx`);
  });
}
