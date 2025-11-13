import { Button } from 'antd';
import { DatePicker } from 'antd';
import { useState } from 'react';
import { SearchParams } from '../../types/SearchParams';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { useHsIncomeReport } from '../../hooks/useHsIncomeReport';
import { createHsOnChangeHandler } from './IncomeReports.handlers';
import { generateBauIncomeExcel } from './IncomeReports.config';

const { RangePicker } = DatePicker;

function HsReport() {
  const [hsSearchParams, setHsSearchParams] = useState<SearchParams | null>(null);
  const [redesignSearchParams, setRedesignSearchParams] = useState<SearchParams | null>(null);

  const onParamsChange = createHsOnChangeHandler(setHsSearchParams, setRedesignSearchParams);

  const { incomeData } = useHsIncomeReport(
    CLICKUP_LIST_IDS.cciHs,
    hsSearchParams,
    redesignSearchParams
  );

  return (
    <main>
      <h1>HS Income Report</h1>
      <RangePicker onChange={onParamsChange} />
      <>
        {incomeData.length > 0 && (
          <Button type="primary" onClick={() => generateBauIncomeExcel(incomeData, 'HS')}>
            Download Income Report
          </Button>
        )}
      </>
    </main>
  );
}

export default HsReport;
