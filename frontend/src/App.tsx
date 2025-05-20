import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import AutoCare from "./app/auto-care/AutoCare";
import AddEditJob from "./app/job-config/AddEdit";
import JobConfigBase from "./app/job-config/JobConfig";
import Root from "./app/layouts/Root";
import Wip from "./app/wip/Wip";
import CustomerBase from "./app/customer/Customer";
import AddEditCustomer from "./app/customer/AddEdit";
import cog from "../../frontend/src/assets/cog.svg";
import garage from "/car-repair.png";
import Home from "./app/home/Home";

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
        path: "/auto-care",
        element: <AutoCare />,
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
