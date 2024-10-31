import "./App.css";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "./app/layouts/Root";
import AutoCare from "./app/auto-care/AutoCare";
import Wip from "./app/wip/Wip";
import JobConfig from "./app/job-config/JobConfig";
import JobView from "./app/job-config/JobView";
import AddEditJob from "./app/job-config/AddEdit";

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
            element: <JobConfig />,
          },
          // {
          //   path: ":jobID",
          //   element: <Outlet />,
          //   children: [
          //     {
          //       path: "",
          //       element: <JobView />,
          //     },
          //     {
          //       path: "edit",
          //       element: <AddEditJob />,
          //     },
          //   ],
          // },
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
