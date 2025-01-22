import { Route, Routes } from "react-router-dom";
import VendorProduction from "./pages/VendorProduction/VendorProduction";
import TaskSyncListSelector from "./pages/TaskSync/TaskSyncListSelector";
import MqmsVerificationSelector from "./pages/MqmsVerification/MqmsVerificationSelector";
import MqmsCheckApprovedTasks from "./pages/MqmsVerification/MqmsCheckApprovedTasks";
import MqmsTimetracking from "./pages/MqmsVerification/MqmsTimetracking";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TaskSyncListSelector />} />
      <Route path="/task-sync" element={<TaskSyncListSelector />} />
      <Route path="/production-contratistas" element={<VendorProduction />} />
      <Route path="/mqms-verification" element={<MqmsVerificationSelector />}>
        <Route
          path="check-approved-tasks"
          element={<MqmsCheckApprovedTasks />}
        />
        <Route path="timetracking" element={<MqmsTimetracking />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
