import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ShoppingCart } from "lucide-react"; // chiroyli ikon
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
    <header className="header">
      <div className="header__inner">
        {/* Chapda: logo */}
        <button
          className="brand"
          onClick={() => nav("/")}
          aria-label="UzbekDoner bosh sahifa"
        >
          {/* public/logo-navbar.png */}
          <img
            src="/logo-navbar.png"
            alt="UzbekDoner"
            className="brand__logo"
            loading="eager"
            decoding="sync"
          />
        </button>

        {/* O‘ngda: savat */}
        <Link to="/cart" className="cart-ind cart-ind--lg" aria-label="Savat">
          <span className="cart-ind__icon">
            <ShoppingCart size={28} strokeWidth={2.25} />
          </span>
          {/* <span className="cart-ind__label">Savat</span> */}
          {count > 0 && <span className="cart-ind__badge">{count}</span>}
        </Link>
      </div>
    </header>
  );
}
