import { Route, Routes } from "react-router-dom";
import VendorProduction from "./pages/VendorProduction/VendorProduction";
import MqmsVerification from "./pages/MqmsVerification/MqmsVerification";
import TaskSyncListSelector from "./pages/TaskSync/TaskSyncListSelector";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TaskSyncListSelector />} />
      <Route path="/task-sync" element={<TaskSyncListSelector />} />
      <Route path="/production-contratistas" element={<VendorProduction />} />
      <Route path="/mqms-verification" element={<MqmsVerification />} />
    </Routes>
  );
}

export default AppRouter;
