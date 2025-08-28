import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useRef } from "react";
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

  // 🔔 Badge anim
  const badgeRef = useRef(null);
  const prevRef = useRef(count);
  useEffect(() => {
    const badge = badgeRef.current;
    if (!badge || count <= 0) {
      prevRef.current = count;
      return;
    }
    // re-trigger animations
    badge.classList.remove("is-bump", "is-shake");
    // force reflow
    void badge.offsetWidth;
    badge.classList.add("is-bump");
    if (count > prevRef.current) {
      badge.classList.add("is-shake");
    }
    prevRef.current = count;
  }, [count]);

  return (
    <header className="header">
      <div className="header__inner header__grid container">
        {/* Chap */}
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

        {/* O‘rta */}
        <div className="header__title">{meta?.title || ""}</div>

        {/* O‘ng: Savat */}
        <div className="cart-ind">
          <Link to="/cart" aria-label="Savat">
            🧺 Savat
          </Link>
          {count > 0 && (
            <span ref={badgeRef} className="cart-ind__badge">
              {count}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
