import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { MonthlyGoalTask } from '../MonthlyGoals.types';

type WarningsExportType = 'BAU' | 'HS';

function getClickUpTaskUrl(taskId: string): string {
  return `https://app.clickup.com/t/${taskId}`;
}

export async function generateWarningsExcel(
  tasksWithWarnings: MonthlyGoalTask[],
  monthYear: string,
  type: WarningsExportType
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Warnings', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  worksheet.columns = [
    { header: 'Task ID', key: 'id', width: 20 },
    { header: 'Task Name', key: 'name', width: 40 },
    { header: 'ClickUp Link', key: 'link', width: 50 },
    { header: 'Warnings', key: 'warnings', width: 80 },
    { header: 'Warning Count', key: 'count', width: 15 },
  ];

  tasksWithWarnings.forEach(task => {
    worksheet.addRow({
      id: task.id,
      name: task.name,
      link: getClickUpTaskUrl(task.id),
      warnings: task.warnings.join('; '),
      count: task.warnings.length,
    });
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDC2626' },
  };

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 5 },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${type}_Warnings_${monthYear}.xlsx`);
}
