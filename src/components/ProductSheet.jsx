import { useMemo, useState, useEffect } from "react";
import { useCart } from "../store/cart";
import Img from "./Img";

/* format helper */
const fmt = (n) => `${Number(n || 0).toLocaleString("uz-UZ")} so‘m`;

/* Safe readers (API variantlarini qamrab oladi) */
const titleOf = (p) =>
  p?.title ??
  p?.name ??
  p?.name_uz ??
  p?.name_ru ??
  p?.product?.name ??
  "Mahsulot";

const imgOf = (p) =>
  p?.img ??
  p?.image ??
  p?.imageUrl ??
  p?.photo?._url ??
  p?.images?.[0] ??
  p?.product?.image ??
  p?.product?.photo?._url ??
  "";

const priceOf = (p) =>
  Number(
    p?.price ??
      p?.priceUZS ??
      p?.amount ??
      p?.product?.price ??
      p?.product?.amount ??
      0
  );

export default function ProductSheet({ open, product, onClose, onAdd }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => setQty(1), [product?.id]);

  /* Compute memoized values BEFORE any conditional return so hook order is stable */
  const title = useMemo(() => titleOf(product), [product]);
  const price = useMemo(() => priceOf(product), [product]);
  const img = useMemo(() => imgOf(product), [product]);
  const total = useMemo(() => (price || 0) * (qty || 0), [price, qty]);

  const isOpen = open == null ? !!product : !!open;
  if (!isOpen || !product) return null; // safe now; hooks above always run

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));

  const addToCart = () => {
    if (!qty || !price) return;
    if (typeof onAdd === "function") {
      onAdd(qty);
    } else {
      add(product, qty);
    }
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
        {/* Close */}
        <button
          className="sheet__close"
          aria-label="Yopish"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        {/* Media */}
        <div className="product-hero">
          {img ? (
            <Img className="product-hero__img" src={img} alt={title} />
          ) : (
            <div className="product-hero__img skeleton" aria-hidden="true" />
          )}
          <div className="product-hero__grad" />
        </div>

        {/* Body */}
        <div style={{ padding: 14, display: "grid", gap: 12 }}>
          <h2 className="product-title">{title}</h2>
          {product?.description && (
            <p className="product-desc">{product.description}</p>
          )}

          {/* Price + qty + total */}
          <div className="price-row">
            <div className="price-left">
              <div className="badge">Jami</div>
              <div className="price-main">{fmt(total || price)}</div>
            </div>
            <div className="qty-side">
              <div className="qty-chip" aria-label="Miqdor">
                <button
                  className="qty-chip__btn"
                  onClick={dec}
                  aria-label="Kamaytirish"
                  type="button"
                >
                  −
                </button>
                <div className="qty-chip__num">{qty}</div>
                <button
                  className="qty-chip__btn"
                  onClick={inc}
                  aria-label="Ko‘paytirish"
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Price line */}
          <div className="total-row">
            <div className="total-label">Bir dona narxi</div>
            <div className="total-value">{fmt(price)}</div>
          </div>

          {/* Primary action */}
          <button
            className={`btn btn--primary btn--lg ${qty > 0 ? "is-pop" : ""}`}
            onClick={addToCart}
            disabled={!qty || !price}
            aria-label="Savatchaga qo‘shish"
            style={{ width: "100%", justifySelf: "stretch" }}
            type="button"
          >
            Savatga qo‘shish — {fmt(total || price)}
          </button>
        </div>
      </div>
    </div>
  );
}
