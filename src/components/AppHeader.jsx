import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useRef, useState } from "react";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import { useCart } from "../store/cart";

export default function AppHeader() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { items } = useCart();

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
      const t = setTimeout(() => setBump(false), 450);
      prevCountRef.current = count;
      return () => clearTimeout(t);
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

          <Link
            to="/cart"
            className="cart-ind cart-ind--lg hide-on-mobile"
            aria-label="Savat"
          >
            <span className="cart-ind__icon">
              <ShoppingCart size={28} strokeWidth={2.25} />
            </span>
            <span className="cart-ind__label">Savat</span>
            {count > 0 && (
              <span className={`cart-ind__badge ${bump ? "is-bump" : ""}`}>
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobil uchun FAB — checkout/cart sahifalarida ko'rsatilmaydi */}
      {!hideFab && (
        <Link
          to="/cart"
          className="cart-fab-mobile show-on-mobile"
          aria-label="Savat"
        >
          <ShoppingCart size={26} strokeWidth={2.5} />
          {count > 0 && <span className="cart-fab-mobile__badge">{count}</span>}
        </Link>
      )}
    </>
  );
}
