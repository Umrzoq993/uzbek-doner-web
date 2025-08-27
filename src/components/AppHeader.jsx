import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useCart } from "../store/cart";

export default function AppHeader() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { items } = useCart();

  const count = useMemo(
    () => items.reduce((s, i) => s + (i.qty || 0), 0),
    [items]
  );

  const meta = useMemo(() => {
    if (pathname === "/cart") return { title: "Savat" };
    if (pathname === "/checkout") return { title: "To‘lov" };
    return null;
  }, [pathname]);

  return (
    <header className="header">
      <div className="header__inner header__grid container">
        {/* Chap: Home’da brend; ichki sahifalarda “orqaga” */}
        <div>
          {meta ? (
            <button
              className="topbar__back"
              aria-label="Orqaga"
              onClick={() => nav(-1)}
            >
              ←
            </button>
          ) : (
            <Link to="/" className="brand">
              UzbekDoner
            </Link>
          )}
        </div>

        {/* O‘rta: ichki sahifalarda sarlavha */}
        <div className="header__title">{meta?.title || ""}</div>

        {/* O‘ng: Savat indikator */}
        <div className="cart-ind">
          <Link to="/cart" aria-label="Savat">
            🧺 Savat
          </Link>
          {count > 0 && <span className="cart-ind__badge">{count}</span>}
        </div>
      </div>
    </header>
  );
}
