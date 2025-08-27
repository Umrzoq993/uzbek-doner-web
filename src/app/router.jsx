import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Checkout from "../pages/Checkout";
import NotFound from "../pages/NotFound";

export default createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "checkout", element: <Checkout /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
