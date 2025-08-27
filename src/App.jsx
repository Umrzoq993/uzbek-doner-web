import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

import "./styles/base.scss";

export default function App() {
  return (
    <>
      <TopBar />
      <main id="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
