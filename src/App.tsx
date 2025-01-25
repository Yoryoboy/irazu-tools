import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./AppLayout";
import TaskSync, { loader as TaskSyncLoader } from "./pages/TaskSync/TaskSync";
import VendorProduction from "./pages/VendorProduction/VendorProduction";
import MqmsVerification from "./pages/MqmsVerification/MqmsVerification";
import Error from "./components/Error";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <h1>TaskSync</h1>,
      },
      {
        path: "/task-sync",
        element: <TaskSync />,
        loader: TaskSyncLoader,
        errorElement: <Error />,
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
