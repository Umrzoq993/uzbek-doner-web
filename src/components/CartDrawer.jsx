import { useCart } from "../store/cart";
import Button from "./ui/Button";
import { Link, useLocation } from "react-router-dom";

export default function CartDrawer() {
  const { items, remove, setQty, total, lineTotal } = useCart();
  const { pathname } = useLocation();
  const isCheckout = pathname === "/checkout";
  const t = total();

  return (
    <>
      <aside className="cart">
        <div className="cart__head">Savat</div>
        <div className="cart__body">
          {items.length === 0 && <div className="cart__empty">Savat bo‘sh</div>}
          {items.map((i, idx) => (
            <div className="cart__item" key={idx}>
              <div className="cart__meta">
                <div className="cart__title">{i.product.name}</div>
                <div className="opt-tags">
                  {i.options?.size && (
                    <span className="opt-tag">{i.options.size.label}</span>
                  )}
                  {i.options?.spicy ? (
                    <span className="opt-tag">Achchiq</span>
                  ) : null}
                  {Array.isArray(i.options?.extras) &&
                    i.options.extras.map((ex) => (
                      <span className="opt-tag" key={ex.key}>
                        {ex.label}
                      </span>
                    ))}
                </div>
                <div className="cart__sub">
                  {lineTotal(idx).toLocaleString()} so‘m
                </div>
              </div>

              <div className="cart__qty">
                <button
                  onClick={() => setQty(idx, i.qty - 1)}
                  aria-label="Kamaytir"
                >
                  −
                </button>
                <span>{i.qty}</span>
                <button
                  onClick={() => setQty(idx, i.qty + 1)}
                  aria-label="Ko'paytir"
                >
                  +
                </button>
              </div>

              <div style={{ textAlign: "right" }}>
                <button
                  className="cart__rm"
                  onClick={() => remove(idx)}
                  aria-label="O'chirish"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart__foot">
          <div className="cart__total">
            <span>Jami:</span>
            <b>{t.toLocaleString()} so‘m</b>
          </div>
          {!isCheckout ? (
            <Button as={Link} to="/checkout" className="w-100 btn--primary">
              Buyurtma berish
            </Button>
          ) : (
            <div className="muted">Chekaut sahifasidasiz</div>
          )}
        </div>
      </aside>

      {!isCheckout && (
        <div className="mobile-cta">
          <div className="mobile-cta__sum">{t.toLocaleString()} so‘m</div>
          <Button as={Link} to="/checkout" className="btn--primary">
            Buyurtma berish
          </Button>
        </div>
      )}
    </>
  );
}
