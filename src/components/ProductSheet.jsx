// src/components/ProductSheet.jsx
import QtyStepper from "./QtyStepper";
import Button from "./ui/Button";
import Img from "./Img";
import { useEffect, useState } from "react";

const fmt = (n) => Number(n || 0).toLocaleString("uz-UZ") + " so‘m";

export default function ProductSheet({ open, product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  useEffect(() => setQty(1), [product?.id]);

  if (!open || !product) return null;
  const price = Number(product.price || 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="sheet sheet--product"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sheet__close" onClick={onClose}>
          ✕
        </button>

        <div className="sheet__body">
          <div className="product-hero">
            <Img
              src={product.imageUrl}
              alt={product.name}
              className="product-hero__img"
            />
            <div className="product-hero__grad" />
            {/* Misol uchun ribbonga joy: <div className="ribbon ribbon--sale">-20%</div> */}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div className="product-title">{product.name}</div>
            {product.description && (
              <p className="product-desc">{product.description}</p>
            )}
            <div className="price-row">
              <div className="price-left">
                <div className="price-main">{fmt(price)}</div>
              </div>
              <div className="qty-side">
                <QtyStepper value={qty} onChange={setQty} />
              </div>
            </div>

            <div className="total-row">
              <div className="total-label">Jami</div>
              <div className="total-value">{fmt(price * qty)}</div>
            </div>
          </div>
        </div>

        <div className="sheet__foot">
          <div />
          <Button className="btn--primary btn--lg" onClick={() => onAdd(qty)}>
            Savatga qo‘shish — {fmt(price * qty)}
          </Button>
        </div>
      </div>
    </div>
  );
}
