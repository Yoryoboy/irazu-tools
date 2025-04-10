import { useFetchClickUpTasks } from '../../hooks/useClickUp';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { Button } from 'antd';
import { DatePicker } from 'antd';
import { useState } from 'react';
import { SearchParams } from '../../types/SearchParams';
import { formatApprovedBauTasks, formatBauIncomeDataForExcel } from '../../utils/tasksFunctions';
import { createOnChangeHandler } from './IncomeReports.handlers';
import { bauPrices, generateBauIncomeExcel } from './IncomeReports.config';

const { RangePicker } = DatePicker;

function BauReport() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const onBauParamsChange = createOnChangeHandler(setSearchParams);

  const { clickUpTasks } = useFetchClickUpTasks(CLICKUP_LIST_IDS.cciBau, searchParams);

  const approvedBauTasks = formatApprovedBauTasks(clickUpTasks);

  const bauIncome = formatBauIncomeDataForExcel(approvedBauTasks, bauPrices);

  return (
    <main>
      <h1>BAU Income Report</h1>
      <RangePicker onChange={onBauParamsChange} />
      <>
        {bauIncome.length > 0 && (
          <Button type="primary" onClick={() => generateBauIncomeExcel(bauIncome, 'BAU')}>
            Download Income Report
          </Button>
        )}
      </>
    </main>
  );
}

export default BauReport;
