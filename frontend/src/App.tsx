import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import AutoCare from "./app/auto-care/AutoCare";
import AddEditJob from "./app/job-config/AddEdit";
import JobConfigBase from "./app/job-config/JobConfig";
import Root from "./app/layouts/Root";
import Wip from "./app/wip/Wip";
import CustomerBase from "./app/customer/Customer";
import AddEditCustomer from "./app/customer/AddEdit";

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
      {
        path: "/customer",
        element: <Outlet />,
        children: [
          {
            path: "",
            element: <CustomerBase />,
          },
          {
            path: "new",
            element: <AddEditCustomer />,
          },
          {
            path: ":customerID",
            element: <AddEditCustomer />,
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
