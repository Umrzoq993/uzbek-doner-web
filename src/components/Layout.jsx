import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "./AppHeader";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import GeoPicker from "./GeoPicker";
import { useLocationStore } from "../store/location";
import DeliveryGuard from "./DeliveryGuard";
import GeoConsent from "./GeoConsent";

export default function Layout() {
  const place = useLocationStore((s) => s.place);
  const openPicker = useLocationStore((s) => s.openPicker);
  const setOpenPicker = useLocationStore((s) => s.setOpenPicker);
  const [forceGeo, setForceGeo] = useState(false);
  const { pathname } = useLocation();
  const hideFooter = ["/cart"].includes(pathname.split("?")[0]);

  // GeoPicker endi faqat foydalanuvchi o'zi chaqirganda yoki consentdan keyin kerak bo'ladi.
  // Shuning uchun avtomatik ochish olib tashlandi.
  useEffect(() => {
    if (place) setForceGeo(false);
  }, [place]);

  return (
    <>
      <AppHeader />
      <main id="content">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <GeoPicker
        open={(forceGeo && !!place) || openPicker}
        onClose={() => {
          setForceGeo(false);
          setOpenPicker(false);
        }}
      />
      <GeoConsent />
      <DeliveryGuard onForceGeo={() => setForceGeo(true)} />
    </>
  );
}
