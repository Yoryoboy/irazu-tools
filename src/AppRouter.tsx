import { Route, Routes } from "react-router-dom";
import TaskSync from "./pages/TaskSync";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<TaskSync />} />
      <Route path="/task-sync" element={<TaskSync />} />
    </Routes>
  );
}

export default AppRouter;
