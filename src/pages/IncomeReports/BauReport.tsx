import { Button } from 'antd';
import { DatePicker } from 'antd';
import { useState } from 'react';
import { SearchParams } from '../../types/SearchParams';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { useBauIncomeReport } from '../../hooks/useBauIncomeReport';
import { createOnChangeHandler } from './IncomeReports.handlers';
import { generateBauIncomeExcel } from './IncomeReports.config';
import BauDashboard from './bauDashboard/BauDashboard';

const { RangePicker } = DatePicker;

function BauReport() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const onBauParamsChange = createOnChangeHandler(setSearchParams);

  const { incomeData } = useBauIncomeReport(CLICKUP_LIST_IDS.cciBau, searchParams);

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">BAU Income Report</h1>
      <div className="flex justify-center gap-5 py-5">
        <RangePicker onChange={onBauParamsChange} />
        <>
          {incomeData.length > 0 && (
            <Button type="primary" onClick={() => generateBauIncomeExcel(incomeData, 'BAU')}>
              Download Income Report
            </Button>
          )}
        </>
      </div>
      <BauDashboard />
    </main>
  );
}

export default BauReport;
