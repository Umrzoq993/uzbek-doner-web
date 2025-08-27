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

export default function ProductOptionsModal({
  open,
  onClose,
  product,
  onConfirm,
}) {
  const [size, setSize] = useState(PRESET.sizes[0]);
  const [spicy, setSpicy] = useState(false);
  const [extras, setExtras] = useState([]);

  useEffect(() => {
    if (open) {
      setSize(PRESET.sizes[0]);
      setSpicy(false);
      setExtras([]);
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
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{product?.name}</div>
          <button className="modal-x" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="opt-block">
            <div className="opt-title">Hajm</div>
            <div className="opt-row">
              {PRESET.sizes.map((s) => (
                <button
                  key={s.value}
                  className={`tag ${size.value === s.value ? "is-active" : ""}`}
                  onClick={() => setSize(s)}
                >
                  {s.label}
                  {s.price > 0 ? ` +${s.price.toLocaleString()} so‘m` : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="opt-block">
            <div className="opt-title">Qo‘shimchalar</div>
            <div className="opt-row">
              {PRESET.extras.map((ex) => {
                const on = extras.some((e) => e.key === ex.key);
                return (
                  <button
                    key={ex.key}
                    className={`tag ${on ? "is-active" : ""}`}
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

          <label className="chk">
            <input
              type="checkbox"
              checked={spicy}
              onChange={(e) => setSpicy(e.target.checked)}
            />
            <span>Achchiq</span>
          </label>
        </div>

        <div className="modal-foot">
          <div className="modal-total">
            Jami:{" "}
            <b>{(Number(product?.price || 0) + delta).toLocaleString()} so‘m</b>
          </div>
          <Button
            className="btn--primary"
            onClick={() => {
              onConfirm({ size, spicy, extras, _priceDelta: delta });
              onClose();
            }}
          >
            Savatga qo‘shish
          </Button>
        </div>
      </div>
    </div>
  );
}
