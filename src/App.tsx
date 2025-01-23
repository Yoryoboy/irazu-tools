import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./AppLayout";
import TaskSync from "./pages/TaskSync/TaskSync";
import VendorProduction from "./pages/VendorProduction/VendorProduction";
import MqmsVerification from "./pages/MqmsVerification/MqmsVerification";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <TaskSync />,
      },
      {
        path: "/task-sync",
        element: <TaskSync />,
      },
      {
        path: "/production-contratistas",
        element: <VendorProduction />,
      },
      {
        path: "/mqms-verification",
        element: <MqmsVerification />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
