// src/pages/Cart.jsx
import { useMemo } from "react";
import { useMoneyFormatter, useT } from "../i18n/i18n";
import { useLangStore } from "../store/lang";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import SuggestRow from "../components/SuggestRow";

/* --- helpers --- */
const legacyFmt = (n) => `${Number(n || 0).toLocaleString("uz-UZ")} so‘m`;

export default function Cart() {
  const nav = useNavigate();
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const fmtMoney = useMoneyFormatter();
  const { items, inc, dec, remove, clear } = useCart();

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0),
    [items]
  );
  const totalQty = useMemo(
    () => items.reduce((s, it) => s + (it.qty || 0), 0),
    [items]
  );
  const disablePay = !items.length || totalQty <= 0 || subtotal <= 0;

  // Savatdagi birinchi mavjud kategoriya (fallback: 49)
  const suggestCategoryId = useMemo(() => {
    for (const it of items) {
      const cid =
        it?.raw?.category?.category_id ??
        it?.category?.category_id ??
        it?.category_id ??
        it?.raw?.category_id ??
        null;
      if (cid != null) return Number(cid);
    }
    return 49; // default Uzbek Doner
  }, [items]);

  const goCheckout = () => {
    if (disablePay) return;
    nav("/checkout");
  };

  return (
    <div className="page has-paybar">
      <div className="container">
        {/* SAVAT */}
        <div className="checkout-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h3 className="checkout-card__title" style={{ margin: 0 }}>
              {t("common:cart")}
            </h3>
            {!!items.length && (
              <button
                className="btn btn--ghost"
                onClick={clear}
                aria-label="Savatchani tozalash"
              >
                {lang === "ru" ? "Очистить" : "Tozalash"}
              </button>
            )}
          </div>

          {!items.length && (
            <div className="checkout-card__muted">{t("common:cart_empty")}</div>
          )}

          {items.map((it) => {
            const raw = it.raw || it.product || {};
            const name =
              lang === "ru"
                ? raw.name_ru || raw.name || it.title || t("product:item")
                : raw.name_uz || raw.name || it.title || t("product:item");
            return (
              <div
                key={it.id}
                className="summary-row"
                style={{ alignItems: "center" }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{name}</div>
                  <small className="checkout-card__muted">
                    {fmtMoney(it.price || 0)} • {it.qty || 0}{" "}
                    {t("common:piece_suffix")}
                  </small>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="qty-chip" aria-label={`${it.title} miqdori`}>
                    <button
                      className="qty-chip__btn"
                      onClick={() => dec(it.id)}
                      aria-label={t("common:decrease")}
                    >
                      −
                    </button>
                    <div className="qty-chip__num">{it.qty || 0}</div>
                    <button
                      className="qty-chip__btn"
                      onClick={() => inc(it.id)}
                      aria-label={t("common:increase")}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="btn btn--subtle-danger"
                    onClick={() => remove(it.id)}
                    aria-label={lang === "ru" ? "Удалить" : "O‘chirish"}
                    title={lang === "ru" ? "Удалить" : "O‘chirish"}
                  >
                    {lang === "ru" ? "Удалить" : "O‘chirish"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUGGESTIONS — mavjud komponentdan foydalanyapmiz */}
        <SuggestRow categoryId={suggestCategoryId} limit={6} />

        {/* “Menyuga qaytish” havolasi (ixtiyoriy) */}
        <div style={{ marginTop: 12 }}>
          <Link to="/" className="btn">
            {lang === "ru" ? "Назад в меню" : "Menyuga qaytish"}
          </Link>
        </div>
      </div>

      {/* PAYBAR */}
      <div className="paybar">
        <div className="paybar__inner">
          <div style={{ fontWeight: 800 }}>
            {lang === "ru" ? "Итого" : "Jami"}:&nbsp; {fmtMoney(subtotal)}
          </div>
          <button
            className="paybar__btn"
            disabled={disablePay}
            onClick={goCheckout}
          >
            {lang === "ru" ? "Перейти к оплате" : "To‘lovga o‘tish"}
          </button>
        </div>
      </div>
    </div>
  );
}
