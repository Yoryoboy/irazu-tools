import { Button } from 'antd';
import { DatePicker } from 'antd';
import { useState } from 'react';
import { SearchParams } from '../../types/SearchParams';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { useBauIncomeReport } from '../../hooks/useBauIncomeReport';
import { createOnChangeHandler } from './IncomeReports.handlers';
import { generateBauIncomeExcel } from './IncomeReports.config';

const { RangePicker } = DatePicker;

function BauReport() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const onBauParamsChange = createOnChangeHandler(setSearchParams);

  const { incomeData } = useBauIncomeReport(CLICKUP_LIST_IDS.cciBau, searchParams);

  return (
    <main>
      <h1>BAU Income Report</h1>
      <RangePicker onChange={onBauParamsChange} />
      <>
        {incomeData.length > 0 && (
          <Button type="primary" onClick={() => generateBauIncomeExcel(incomeData, 'BAU')}>
            Download Income Report
          </Button>
        )}
      </>
    </main>
  );
}

export default BauReport;
