// src/components/TopBar.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";

export default function TopBar() {
  const { pathname } = useLocation();
  const nav = useNavigate();

  const meta = useMemo(() => {
    if (pathname === "/cart") return { title: "Savat" };
    if (pathname === "/checkout") return { title: "To‘lov" };
    return null;
  }, [pathname]);

  if (!meta) return null;

  return (
    <div className="topbar">
      <button
        className="topbar__back"
        aria-label="Orqaga"
        onClick={() => nav(-1)}
      >
        ←
      </button>
      <div className="topbar__title">{meta.title}</div>
      <div className="topbar__right" />
    </div>
  );
}
