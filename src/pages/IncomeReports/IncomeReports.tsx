import { useFetchClickUpTasks } from '../../hooks/useClickUp';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { CustomField, User } from '../../types/Task';
import { Button } from 'antd';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import { SearchParams } from '../../types/SearchParams';
import { formatApprovedBauTasks, getCustomField } from '../../utils/tasksFunctions';
import { bauPrices } from './IncomeReports.config';

const { RangePicker } = DatePicker;

function IncomeReports() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  function onChange(dates: [Dayjs | null, Dayjs | null]) {
    if (dates && dates[0] && dates[1]) {
      const [startDate, endDate] = dates;
      const startTimestamp = startDate.unix() * 1000;
      const endTimestamp = endDate.unix() * 1000;
      const bauSearchParams: SearchParams = {
        'statuses[]': ['approved'],
        custom_fields: JSON.stringify([
          {
            field_id: getCustomField('ACTUAL COMPLETION DATE').id,
            operator: 'RANGE',
            value: [startTimestamp, endTimestamp],
          },
        ]),
      };
      console.log(bauSearchParams);
      setSearchParams(bauSearchParams);
    }
  }

  const { clickUpTasks } = useFetchClickUpTasks(CLICKUP_LIST_IDS.cciBau, searchParams);

  const approvedBauTasks = formatApprovedBauTasks(clickUpTasks);

  console.log(approvedBauTasks);

  // const bauIncome = approvedBauTasks.reduce<
  //   Array<{
  //     id: string;
  //     name: string;
  //     designers: string;
  //     receivedDate: Date | null;
  //     completionDate: Date | null;
  //     code: string;
  //     quantity: string | number | User[] | null | undefined;
  //     price: number;
  //     total: number;
  //   }>
  // >((acc, task) => {
  //   task.codes?.forEach(code => {
  //     acc.push({
  //       id: task.id,
  //       name: task.name,
  //       designers: task.designers,
  //       receivedDate: task.receivedDate ? new Date(task.receivedDate) : null,
  //       completionDate: task.completionDate ? new Date(task.completionDate) : null,
  //       code: code.name || '',
  //       quantity: code.value,
  //       price: bauPrices[code.name as keyof typeof bauPrices] || 0,
  //       total: Number(code.value) * (bauPrices[code.name as keyof typeof bauPrices] || 0),
  //     });
  //   });
  //   return acc;
  // }, []);

  return (
    <main>
      <RangePicker onChange={onChange} />
      {/* <>
        {bauIncome.length > 0 && (
          <Button
            type="primary"
            onClick={() => {
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
              bauIncome.forEach(row => {
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
            }}
          >
            Download Income Report
          </Button>
        )}
      </> */}
    </main>
  );
}

export default IncomeReports;
