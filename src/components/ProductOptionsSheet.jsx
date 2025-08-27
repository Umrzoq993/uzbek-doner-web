import { useEffect, useMemo, useState } from "react";
import Button from "./ui/Button";

const PRESET = {
  sizes: [
    { value: "regular", label: "O‘rtacha", price: 0 },
    { value: "large", label: "Katta", price: 3000 },
  ],
  extras: [
    { key: "cheese", label: "Qo‘shimcha pishloq", price: 3000 },
    { key: "sauce", label: "Qo‘shimcha sous", price: 2000 },
    { key: "meat", label: "Qo‘shimcha go‘sht", price: 5000 },
  ],
};

export default function ProductOptionsSheet({
  open,
  onClose,
  product,
  onConfirm,
}) {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(PRESET.sizes[0]);
  const [extras, setExtras] = useState([]);
  const [spicy, setSpicy] = useState(false);

  useEffect(() => {
    if (open) {
      setQty(1);
      setSize(PRESET.sizes[0]);
      setExtras([]);
      setSpicy(false);
    }
  }, [open, product?.id]);

  const delta = useMemo(() => {
    let d = Number(size?.price || 0);
    for (const ex of extras) d += Number(ex.price || 0);
    return d;
  }, [size, extras]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <div className="sheet__title">{product?.name}</div>
          <button className="btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="sheet__body">
          <div>
            <b>Narx:</b> {Number(product?.price || 0).toLocaleString()} so‘m
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Hajm</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESET.sizes.map((s) => (
                <button
                  key={s.value}
                  className={`btn ${
                    size.value === s.value ? "btn--primary" : ""
                  }`}
                  onClick={() => setSize(s)}
                >
                  {s.label}
                  {s.price > 0 ? ` +${s.price.toLocaleString()} so‘m` : ""}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Qo‘shimchalar
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESET.extras.map((ex) => {
                const on = extras.some((e) => e.key === ex.key);
                return (
                  <button
                    key={ex.key}
                    className={`btn ${on ? "btn--primary" : ""}`}
                    onClick={() =>
                      on
                        ? setExtras(extras.filter((e) => e.key !== ex.key))
                        : setExtras([...extras, ex])
                    }
                  >
                    {ex.label} +{ex.price.toLocaleString()} so‘m
                  </button>
                );
              })}
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={spicy}
              onChange={(e) => setSpicy(e.target.checked)}
            />
            <span>Achchiq</span>
          </label>
        </div>

        <div className="sheet__foot">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="btn"
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              −
            </button>
            <b>{qty}</b>
            <button className="btn" onClick={() => setQty(qty + 1)}>
              +
            </button>
          </div>
          <Button
            onClick={() => {
              onConfirm({ size, extras, spicy, _priceDelta: delta }, qty);
              onClose();
            }}
            className="btn--primary"
          >
            Qo‘shish •{" "}
            {((Number(product?.price || 0) + delta) * qty).toLocaleString()}{" "}
            so‘m
          </Button>
        </div>
      </div>
    </div>
  );
}
