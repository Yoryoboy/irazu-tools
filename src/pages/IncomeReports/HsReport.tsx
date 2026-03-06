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
  const [preasbuiltSearchParams, setPreasbuiltSearchParams] = useState<SearchParams | null>(null);
  const [designSearchParams, setDesignSearchParams] = useState<SearchParams | null>(null);
  const [redesignSearchParams, setRedesignSearchParams] = useState<SearchParams | null>(null);

  const onParamsChange = createHsOnChangeHandler(
    setPreasbuiltSearchParams,
    setDesignSearchParams,
    setRedesignSearchParams
  );

  const { incomeData } = useHsIncomeReport(
    CLICKUP_LIST_IDS.cciHs,
    preasbuiltSearchParams,
    designSearchParams,
    redesignSearchParams
  );

  return (
    <main>
      <h1 className="text-2xl font-bold">HS Income Report</h1>
      <div className="flex justify-center gap-5 py-5">
        <RangePicker onChange={onParamsChange} />
        <>
          {incomeData.length > 0 && (
            <Button
              type="primary"
              onClick={() => generateBauIncomeExcel(incomeData, 'HS', { includeStatus: true })}
            >
              Download Income Report
            </Button>
          )}
        </>
      </div>
    </main>
  );
}

export default HsReport;
