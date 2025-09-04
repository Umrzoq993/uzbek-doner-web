import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useRef, useState } from "react";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import { useCart } from "../store/cart";
import { useT } from "../i18n/i18n";
import { useLocationStore } from "../store/location";
import { useLangStore } from "../store/lang";

export default function AppHeader() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { items } = useCart();
  const t = useT();
  const { lang, setLang } = useLangStore();
  const place = useLocationStore((s) => s.place);
  const availability = useLocationStore((s) => s.availability);
  const setOpenPicker = useLocationStore((s) => s.setOpenPicker);
  const clearPlace = useLocationStore((s) => s.clearPlace);

  const count = useMemo(
    () => items.reduce((s, i) => s + (i.qty || 0), 0),
    [items]
  );

  const showBack = useMemo(() => {
    const path = pathname.split("?")[0];
    return path !== "/" && path !== "";
  }, [pathname]);

  const hideFab = ["/cart", "/checkout"].includes(pathname.split("?")[0]);

  const goBack = () => {
    if (window.history.length > 1) nav(-1);
    else nav("/");
  };

  const prevCountRef = useRef(count);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (prevCountRef.current !== count) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 450);
      prevCountRef.current = count;
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <>
      <header className="header">
        <div className="header__inner">
          {showBack && (
            <button
              className="header__back header__back--desktop"
              aria-label="Orqaga"
              onClick={goBack}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
          )}

          <button
            className="brand"
            onClick={() => nav("/")}
            aria-label="UzbekDoner bosh sahifa"
          >
            <img
              src="/logo-navbar.png"
              alt="UzbekDoner"
              className="brand__logo"
              loading="eager"
              decoding="sync"
            />
          </button>

          {/* Cart button header varianti olib tashlandi – endi har doim floating FAB */}

          <button
            type="button"
            onClick={() => setLang(lang === "uz" ? "ru" : "uz")}
            className="chip lang-switch"
            style={{
              fontSize: 12,
              marginLeft: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            aria-label="Switch language"
          >
            <span className="lang-switch__flag" aria-hidden>
              {lang === "uz" ? "🇷🇺" : "🇺🇿"}
            </span>
            <span className="lang-switch__code">
              {lang === "uz" ? "RU" : "UZ"}
            </span>
          </button>

          {/* Manzil ko'rsatish / o'zgartirish */}
          {place && availability?.available ? (
            <div className="header-loc" style={{ marginLeft: 14 }}>
              <button
                type="button"
                onClick={() => setOpenPicker(true)}
                className="header-loc__btn"
                aria-label="Manzilni o'zgartirish"
                title={place.label}
              >
                <span className="header-loc__pin" aria-hidden>
                  📍
                </span>
                <span className="header-loc__text">
                  {place.street ||
                    place.label ||
                    (lang === "ru" ? "Адрес" : "Manzil")}
                </span>
                <span className="header-loc__change">
                  {lang === "ru" ? "Изм." : "O'zgartirish"}
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpenPicker(true)}
              className="chip"
              style={{
                fontSize: 12,
                marginLeft: 12,
                background: "var(--primary, #2563eb)",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {place
                ? lang === "ru"
                  ? "Адрес недоступен"
                  : "Manzil noqulay"
                : t("common:select_address_button")}
            </button>
          )}
        </div>
      </header>

      {/* Mobil + Desktop FAB lar — checkout/cart sahifalarida ko'rsatilmaydi */}
      {!hideFab && (
        <Link to="/cart" className="cart-fab" aria-label={t("common:cart")}>
          <ShoppingCart size={26} strokeWidth={2.5} />
          {count > 0 && (
            <span className="cart-fab-mobile__badge" aria-live="polite">
              {count}
            </span>
          )}
        </Link>
      )}
    </>
  );
}
