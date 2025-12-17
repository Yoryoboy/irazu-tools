import { Button } from 'antd';
import { DatePicker } from 'antd';
import { useState } from 'react';
import { SearchParams } from '../../types/SearchParams';
import { CLICKUP_LIST_IDS } from '../../utils/config';
import { useTrueNetIncomeReport } from '../../hooks/useTrueNetIncomeReport';
import { createTrueNetOnChangeHandler } from './IncomeReports.handlers';
import { generateBauIncomeExcel } from './IncomeReports.config';

const { RangePicker } = DatePicker;

function TrueNetReport() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const onTrueNetParamsChange = createTrueNetOnChangeHandler(setSearchParams);

  const { incomeData } = useTrueNetIncomeReport(CLICKUP_LIST_IDS.trueNetBau, searchParams);

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">TrueNet Income Report</h1>
      <div className="flex justify-center gap-5 py-5">
        <RangePicker onChange={onTrueNetParamsChange} />
        <>
          {incomeData.length > 0 && (
            <Button type="primary" onClick={() => generateBauIncomeExcel(incomeData, 'TrueNet')}>
              Download Income Report
            </Button>
          )}
        </>
      </div>
    </main>
  );
}

export default TrueNetReport;
