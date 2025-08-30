import { useCart } from "../store/cart";
import Button from "./ui/Button";
import { Link, useLocation } from "react-router-dom";
import { useLangStore } from "../store/lang";
import { useT, useMoneyFormatter } from "../i18n/i18n";

export default function CartDrawer() {
  const { items, remove, setQty, total, lineTotal } = useCart();
  const { pathname } = useLocation();
  const isCheckout = pathname === "/checkout";
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const grandTotal = total();
  const fmtMoney = useMoneyFormatter();

  return (
    <>
      <aside className="cart">
        <div className="cart__head">{t("common:cart")}</div>
        <div className="cart__body">
          {items.length === 0 && (
            <div className="cart__empty">{t("common:cart_empty")}</div>
          )}
          {items.map((i, idx) => (
            <div className="cart__item" key={idx}>
              <div className="cart__meta">
                <div className="cart__title">
                  {lang === "ru"
                    ? i.product.name_ru || i.product.name
                    : i.product.name_uz || i.product.name}
                </div>
                <div className="opt-tags">
                  {i.options?.size && (
                    <span className="opt-tag">{i.options.size.label}</span>
                  )}
                  {i.options?.spicy ? (
                    <span className="opt-tag">
                      {lang === "ru" ? "Остро" : "Achchiq"}
                    </span>
                  ) : null}
                  {Array.isArray(i.options?.extras) &&
                    i.options.extras.map((ex) => (
                      <span className="opt-tag" key={ex.key}>
                        {ex.label}
                      </span>
                    ))}
                </div>
                <div className="cart__sub">{fmtMoney(lineTotal(idx))}</div>
              </div>

              <div className="cart__qty">
                <button
                  onClick={() => setQty(idx, i.qty - 1)}
                  aria-label={t("common:decrease")}
                >
                  −
                </button>
                <span>{i.qty}</span>
                <button
                  onClick={() => setQty(idx, i.qty + 1)}
                  aria-label={t("common:increase")}
                >
                  +
                </button>
              </div>

              <div style={{ textAlign: "right" }}>
                <button
                  className="cart__rm"
                  onClick={() => remove(idx)}
                  aria-label={lang === "ru" ? "Удалить" : "O'chirish"}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart__foot">
          <div className="cart__total">
            <span>{t("checkout:total")}:</span>
            <b>{fmtMoney(grandTotal)}</b>
          </div>
          {!isCheckout ? (
            <Button as={Link} to="/checkout" className="w-100 btn--primary">
              {lang === "ru" ? "Оформить заказ" : "Buyurtma berish"}
            </Button>
          ) : (
            <div className="muted">
              {lang === "ru"
                ? "Вы на странице оформления"
                : "Chekaut sahifasidasiz"}
            </div>
          )}
        </div>
      </aside>

      {!isCheckout && (
        <div className="mobile-cta">
          <div className="mobile-cta__sum">{fmtMoney(grandTotal)}</div>
          <Button as={Link} to="/checkout" className="btn--primary">
            {lang === "ru" ? "Оформить заказ" : "Buyurtma berish"}
          </Button>
        </div>
      )}
    </>
  );
}
