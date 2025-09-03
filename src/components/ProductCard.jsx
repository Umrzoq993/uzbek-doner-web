import { useState, useMemo } from "react";
import Button from "./ui/Button";
import { useCart } from "../store/cart";
import noImage from "../assets/no-image.png";

const fmt = (n) =>
  new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(
    Number(n || 0)
  ) + " so‘m";

export default function ProductCard({ product, onAdd, onOpen }) {
  const [imgSrc, setImgSrc] = useState(product.imageUrl || noImage);
  const { items, add, inc, dec } = useCart();

  // Derive cart item (simple id match like store's idOf logic subset)
  const pid =
    product?.id ||
    product?._id ||
    product?.product_id ||
    product?.iiko_product_id ||
    product?.sku ||
    product?.slug ||
    product?.code ||
    product?.uuid;
  const cartItem = items.find((x) => x.id === pid);

  const discounted = Number(product.discount || 0) > 0;
  const oldPrice = product.oldPrice;
  const unitPrice = useMemo(
    () =>
      discounted
        ? Math.round(
            Number(product.price) * (1 - Number(product.discount) / 100)
          )
        : Number(product.price),
    [discounted, product.price, product.discount]
  );

  return (
    <div
      className="card"
      onClick={onOpen}
      role="button"
      style={{
        padding: 0,
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "160px 1fr",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(noImage)}
          style={{
            width: "100%",
            height: 160,
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,.35) 100%)",
          }}
        />
        {discounted && (
          <div className="ribbon ribbon--sale" style={{ left: 10, top: 10 }}>
            -{Number(product.discount)}%
          </div>
        )}
      </div>

      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 900 }}>{product.name}</div>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          {product.description || " "}
        </div>

        <div
          style={{
            marginTop: 2,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontWeight: 900 }}>{fmt(unitPrice)}</div>
            {oldPrice && (
              <div
                style={{
                  color: "var(--muted)",
                  textDecoration: "line-through",
                  fontSize: 13,
                }}
              >
                {fmt(oldPrice)}
              </div>
            )}
          </div>
          {!cartItem && (
            <Button
              className="btn--primary"
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.classList.add("is-pop");
                setTimeout(
                  () => e.currentTarget.classList.remove("is-pop"),
                  180
                );
                onAdd ? onAdd() : add(product, 1);
              }}
            >
              Qo‘shish
            </Button>
          )}
          {cartItem && (
            <div
              className="qty-chip qty-chip--lg"
              onClick={(e) => e.stopPropagation()}
              aria-label="Miqdor"
            >
              <button
                className="qty-chip__btn"
                onClick={(e) => {
                  e.stopPropagation();
                  dec(pid);
                }}
                aria-label="Kamaytirish"
              >
                −
              </button>
              <div className="qty-chip__num">{cartItem.qty || 0}</div>
              <button
                className="qty-chip__btn"
                onClick={(e) => {
                  e.stopPropagation();
                  inc(pid);
                }}
                aria-label="Ko‘paytirish"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
