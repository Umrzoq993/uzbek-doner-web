import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import GeoPicker from "./GeoPicker";
import { useLocationStore } from "../store/location";
import DeliveryGuard from "./DeliveryGuard";

export default function Layout() {
  const place = useLocationStore((s) => s.place);
  const openPicker = useLocationStore((s) => s.openPicker);
  const setOpenPicker = useLocationStore((s) => s.setOpenPicker);
  const [forceGeo, setForceGeo] = useState(false);

  useEffect(() => {
    // Sahifaga ilk kirganda manzil yo'q bo'lsa so'raymiz
    if (!place) {
      const t = setTimeout(() => setForceGeo(true), 300); // kichik kechikish UX uchun
      return () => clearTimeout(t);
    }
  }, [place]);

  return (
    <>
      <AppHeader />
      <main id="content">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <GeoPicker
        open={(forceGeo && !place) || openPicker}
        onClose={() => {
          setForceGeo(false);
          setOpenPicker(false);
        }}
      />
      <DeliveryGuard onForceGeo={() => setForceGeo(true)} />
    </>
  );
}
