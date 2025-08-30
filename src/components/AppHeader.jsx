import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../store/cart";

export default function AppHeader() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { items } = useCart();

  const count = useMemo(
    () => items.reduce((s, i) => s + (i.qty || 0), 0),
    [items]
  );

  return (
    <>
      {/* Header: mobile’da sticky emas (SCSS’da boshqariladi), desktop’da fixed */}
      <header className="header">
        <div className="header__inner">
          {/* chapda logotip */}
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

          {/* o‘ngda cart – faqat >= md ko‘rinadi (SCSS) */}
          <Link
            to="/cart"
            className="cart-ind cart-ind--lg hide-on-mobile"
            aria-label="Savat"
          >
            <span className="cart-ind__icon">
              <ShoppingCart size={28} strokeWidth={2.25} />
            </span>
            <span className="cart-ind__label">Savat</span>
            {count > 0 && <span className="cart-ind__badge">{count}</span>}
          </Link>
        </div>
      </header>

      {/* Mobil uchun pastki o‘ngda FAB (doim ko‘rinadi, faqat < md) */}
      <Link
        to="/cart"
        className="cart-fab-mobile show-on-mobile"
        aria-label="Savat"
      >
        <ShoppingCart size={26} strokeWidth={2.5} />
        {count > 0 && <span className="cart-fab-mobile__badge">{count}</span>}
      </Link>
    </>
  );
}
