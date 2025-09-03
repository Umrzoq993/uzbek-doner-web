import { useState, useEffect, useMemo } from "react";
import { useT, useMoneyFormatter } from "../i18n/i18n";
import { useLangStore } from "../store/lang";
import { useCart } from "../store/cart";
import Img from "./Img";

// (legacy formatter removed; use useMoneyFormatter hook instead)

const titleOf = (p) =>
  p?.title || p?.name || p?.name_uz || p?.name_ru || p?.product?.name || "";
const imgOf = (p) =>
  p?.img ||
  p?.image ||
  p?.imageUrl ||
  p?.photo?._url ||
  p?.images?.[0] ||
  p?.product?.image ||
  p?.product?.photo?._url ||
  "";
const priceOf = (p) =>
  Number(
    p?.price ||
      p?.priceUZS ||
      p?.amount ||
      p?.product?.price ||
      p?.product?.amount ||
      0
  );

export default function ProductSheet({ open, product, onClose, onAdd }) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const fmtMoney = useMoneyFormatter();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => setQty(1), [product?.id]);

  const title = useMemo(() => {
    if (!product) return "";
    if (lang === "ru") return product.name_ru || titleOf(product);
    return product.name_uz || titleOf(product);
  }, [product, lang]);
  const price = useMemo(() => priceOf(product), [product]);
  const img = useMemo(() => imgOf(product), [product]);
  const total = useMemo(() => (price || 0) * (qty || 0), [price, qty]);

  const isOpen = open == null ? !!product : !!open;
  if (!isOpen || !product) return null;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));

  const addToCart = () => {
    if (!qty || !price) return;
    if (typeof onAdd === "function") onAdd(qty);
    else add(product, qty);
    onClose?.();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="sheet sheet--product"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="sheet__close"
          aria-label="×"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <div className="product-hero">
          {img ? (
            <Img className="product-hero__img" src={img} alt={title} />
          ) : (
            <div className="product-hero__img skeleton" aria-hidden="true" />
          )}
          <div className="product-hero__grad" />
        </div>
        <div style={{ padding: 14, display: "grid", gap: 12 }}>
          <h2 className="product-title">{title}</h2>
          {(() => {
            if (!product) return null;
            const desc =
              lang === "ru"
                ? product.description_ru || product.description
                : product.description_uz || product.description;
            return desc ? <p className="product-desc">{desc}</p> : null;
          })()}
          <div className="price-row">
            <div className="price-left">
              <div className="badge">{t("checkout:total")}</div>
              <div className="price-main">{fmtMoney(total || price)}</div>
            </div>
            <div className="qty-side">
              <div className="qty-chip" aria-label={t("product:quantity")}>
                <button
                  className="qty-chip__btn"
                  onClick={dec}
                  aria-label={t("common:decrease")}
                  type="button"
                >
                  −
                </button>
                <div className="qty-chip__num" aria-live="polite">
                  {qty}
                </div>
                <button
                  className="qty-chip__btn"
                  onClick={inc}
                  aria-label={t("common:increase")}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="total-row">
            <div className="total-label">{t("product:unit_price")}</div>
            <div className="total-value">{fmtMoney(price)}</div>
          </div>
          <button
            className={`btn btn--primary btn--lg ${qty > 0 ? "is-pop" : ""}`}
            onClick={addToCart}
            disabled={!qty || !price}
            aria-label={t("common:add_to_cart")}
            style={{ width: "100%", justifySelf: "stretch" }}
            type="button"
          >
            {t("common:add_to_cart")} — {fmtMoney(total || price)}
          </button>
        </div>
      </div>
    </div>
  );
}
