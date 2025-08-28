import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";

export default function Layout() {
  return (
    <>
      <AppHeader />
      <main id="content">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
    </>
  );
}
