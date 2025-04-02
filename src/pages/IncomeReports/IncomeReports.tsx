
import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { CLICKUP_LIST_IDS } from "../../utils/config";
import { SearchParams } from "../../types/SearchParams";

const bauSearchParams: SearchParams = {
  "statuses[]": ["approved"],
};

function IncomeReports() {

  const { clickUpTasks: approvedBauTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciBau,
    bauSearchParams
  );

  console.log(approvedBauTasks)


  
  return (
    <main>

    </main>
  );
}

export default IncomeReports;