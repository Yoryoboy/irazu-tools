import { Route, Routes } from "react-router-dom";
import TaskSyncListSelector from "./pages/TaskSync/TaskSyncListSelector";
import MqmsVerificationSelector from "./pages/MqmsVerification/MqmsVerificationSelector";
import MqmsTimetracking from "./pages/MqmsVerification/SyncTimetracking/MqmsTimetracking";
import MqmsListConfigForCheckApproved from "./pages/MqmsVerification/MqmsListConfigForCheckApproved";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TaskSyncListSelector />} />
      <Route path="/task-sync" element={<TaskSyncListSelector />} />
      <Route path="/mqms-verification" element={<MqmsVerificationSelector />}>
        <Route
          path="check-approved-tasks"
          element={<MqmsListConfigForCheckApproved />}
        />
        <Route path="timetracking" element={<MqmsTimetracking />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
