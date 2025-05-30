import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import cog from "../../frontend/src/assets/cog.svg";
import "./App.css";
import AddEditCustomer from "./app/customer/AddEdit";
import CustomerBase from "./app/customer/Customer";
import Home from "./app/home/Home";
import AddEditJob from "./app/job-config/AddEdit";
import JobConfigBase from "./app/job-config/JobConfig";
import Root from "./app/layouts/Root";
import AddEditRepair from "./app/repair/AddEdit";
import RepairBase from "./app/repair/Repair";
import AddEditService from "./app/services/AddEditService";
import ServiceBase from "./app/services/ServiceBase";
import garage from "/car-repair.png";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/service",
        element: <Outlet />,
        children: [
          {
            path: "",
            element: <ServiceBase />,
          },
          {
            path: "new",
            element: <AddEditService />,
          },
          {
            path: ":serviceID",
            element: <AddEditService />,
          },
        ],
      },
      {
        path: "/repair",
        element: <Outlet />,
        children: [
          {
            path: "",
            element: <RepairBase />,
          },
          {
            path: "new",
            element: <AddEditRepair />,
          },
          {
            path: ":repairID",
            element: <AddEditRepair />,
          },
        ],
      },
      {
        path: "/users",
        element: (
          <>
            <div className="w-full flex flex-col justify-center item-center">
              <div className="flex justify-center">
                <a href="#" target="_blank">
                  <img src={garage} className="logo" alt="Vite logo" />
                </a>
                <a href="" target="_blank">
                  <img src={cog} className="logo react" alt="React logo" />
                </a>
              </div>
              <h1 className="text-black">Ride Recap - Users</h1>
              <p className="read-the-docs">Work in Progress</p>
            </div>
          </>
        ),
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
