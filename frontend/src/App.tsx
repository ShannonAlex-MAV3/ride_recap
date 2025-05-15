import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import AutoCare from "./app/auto-care/AutoCare";
import AddEditJob from "./app/job-config/AddEdit";
import JobConfigBase from "./app/job-config/JobConfig";
import Root from "./app/layouts/Root";
import Wip from "./app/wip/Wip";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/home",
        element: <Wip />,
      },
      {
        path: "/auto-care",
        element: <AutoCare />,
      },
      {
        path: "/users",
        element: <>Users</>,
      },
      {
        path: "/job-config",
        element: <Outlet />,
        children: [
          {
            path: "",
            element: <JobConfigBase />,
          },
          {
            path: ":jobID",
            element: <AddEditJob />,
          },
          {
            path: "new",
            element: <AddEditJob />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
