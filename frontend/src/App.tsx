
import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Root from './app/layouts/Root';
import AutoCare from './app/auto-care/AutoCare';
import Home from './app/home/Home';
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
        path: '/users',
        element: <>Users</>
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
