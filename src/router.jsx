// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/cart", element: <Cart /> },
      { path: "/checkout", element: <Checkout /> },
    ],
  },
]);

export default router;
