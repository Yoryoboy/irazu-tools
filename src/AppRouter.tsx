import { Route, Routes } from "react-router-dom";
import TaskSync from "./pages/TaskSync/TaskSync";
import VendorProduction from "./pages/VendorProduction/VendorProduction";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TaskSync />} />
      <Route path="/task-sync" element={<TaskSync />} />
      <Route path="/production-contratistas" element={<VendorProduction />} />
    </Routes>
  );
}

export default AppRouter;
