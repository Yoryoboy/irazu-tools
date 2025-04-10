import { Route, Routes } from "react-router-dom";
import VendorProduction from "./pages/VendorProduction/VendorProduction";
import TaskSyncListSelector from "./pages/TaskSync/TaskSyncListSelector";
import MqmsVerificationSelector from "./pages/MqmsVerification/MqmsVerificationSelector";
import MqmsTimetracking from "./pages/MqmsVerification/SyncTimetracking/MqmsTimetracking";
import MqmsListConfigForCheckApproved from "./pages/MqmsVerification/MqmsListConfigForCheckApproved";
import IncomeReports from "./pages/IncomeReports/IncomeReports";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TaskSyncListSelector />} />
      <Route path="/task-sync" element={<TaskSyncListSelector />} />
      <Route path="/production-contratistas" element={<VendorProduction />} />
      <Route path="/mqms-verification" element={<MqmsVerificationSelector />}>
        <Route
          path="check-approved-tasks"
          element={<MqmsListConfigForCheckApproved />}
        />
        <Route path="timetracking" element={<MqmsTimetracking />} />
      </Route>
      <Route path="/income-reports" element={<IncomeReports />} />
    </Routes>
  );
}

export default AppRouter;
