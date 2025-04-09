import { useFetchClickUpTasks } from '../../hooks/useClickUp';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { Button } from 'antd';
import { DatePicker } from 'antd';
import { useState } from 'react';
import { SearchParams } from '../../types/SearchParams';
import { formatApprovedHsTasks, formatBauIncomeDataForExcel } from '../../utils/tasksFunctions';
import { createHsOnChangeHandler } from './IncomeReports.handlers';
import { generateBauIncomeExcel } from './IncomeReports.config';

const { RangePicker } = DatePicker;

function HsReport() {
  const [hsSearchParams, setHsSearchParams] = useState<SearchParams | null>(null);
  const [redesignSearchParams, setRedesignSearchParams] = useState<SearchParams | null>(null);

  const onParamsChange = createHsOnChangeHandler(setHsSearchParams, setRedesignSearchParams);

  const { clickUpTasks: hsClickUpTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciHs,
    hsSearchParams
  );
  const { clickUpTasks: redesignClickUpTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciHs,
    redesignSearchParams
  );

  const approvedHsTasks =
    hsClickUpTasks.length > 0 && redesignClickUpTasks.length > 0
      ? formatApprovedHsTasks([...hsClickUpTasks, ...redesignClickUpTasks])
      : [];

  console.log(approvedHsTasks);

  const HsIncome = formatBauIncomeDataForExcel(approvedHsTasks);

  return (
    <main>
      <h1>HS Income Report</h1>
      <RangePicker onChange={onParamsChange} />
      <>
        {HsIncome.length > 0 && (
          <Button type="primary" onClick={() => generateBauIncomeExcel(HsIncome)}>
            Download Income Report
          </Button>
        )}
      </>
    </main>
  );
}

export default HsReport;
