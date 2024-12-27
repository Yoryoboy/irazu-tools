import { Route, Routes } from "react-router-dom";
import TaskSync from "./pages/TaskSync/TaskSync";
import VendorProduction from "./pages/VendorProduction/VendorProduction";
import MqmsVerification from "./pages/MqmsVerification/MqmsVerification";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TaskSync />} />
      <Route path="/task-sync" element={<TaskSync />} />
      <Route path="/production-contratistas" element={<VendorProduction />} />
      <Route path="/mqms-verification" element={<MqmsVerification />} />
    </Routes>
  );
}

export default AppRouter;
