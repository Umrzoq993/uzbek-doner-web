import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Footer from "./Footer";

export default function Layout() {
  return (
    <>
      <AppHeader />
      <main id="content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
