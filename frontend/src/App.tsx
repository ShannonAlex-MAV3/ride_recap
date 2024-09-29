
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css';
import AutoCare from './app/auto-care/AutoCare';
import Customer from './app/customers/Customer';
import Customers from './app/customers/Customers';
import Root from './app/layouts/Root';
import Wip from './app/wip/Wip';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/home',
        element: <Wip />,
      },
      {
        path: '/auto-care',
        element: <AutoCare />,
      },
      {
        path: '/customers',
        element: <Outlet />,
        children: [
          {
            path: "",
            element: <Customers />
          },
          {
            path: "add",
            element: <Customer />
          }
        ],
      }
    ],
  }
]);

function App() {

  return (
    <RouterProvider router={router}/>
  )
}

export default App
