import { useState, useEffect, useMemo } from "react";
import Button from "./ui/Button";
import { useT, useMoneyFormatter } from "../i18n/i18n";
import { useLangStore } from "../store/lang";

const PRESET = {
  sizes: [
    { value: "regular", label_uz: "O‘rtacha", label_ru: "Средний", price: 0 },
    { value: "large", label_uz: "Katta", label_ru: "Большой", price: 3000 },
  ],
  extras: [
    {
      key: "cheese",
      label_uz: "Qo‘shimcha pishloq",
      label_ru: "Доп. сыр",
      price: 3000,
    },
    {
      key: "sauce",
      label_uz: "Qo‘shimcha sous",
      label_ru: "Доп. соус",
      price: 2000,
    },
    {
      key: "meat",
      label_uz: "Qo‘shimcha go‘sht",
      label_ru: "Доп. мясо",
      price: 5000,
    },
  ],
};

export default function ProductOptionsModal({
  open,
  onClose,
  product,
  onConfirm,
}) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const fmtMoney = useMoneyFormatter();
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
          <div className="modal-title">
            {lang === "ru"
              ? product?.name_ru || product?.name
              : product?.name_uz || product?.name}
          </div>
          <button className="modal-x" onClick={onClose} aria-label="×">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="opt-block">
            <div className="opt-title">{t("product:size")}</div>
            <div className="opt-row">
              {PRESET.sizes.map((s) => (
                <button
                  key={s.value}
                  className={`tag ${size.value === s.value ? "is-active" : ""}`}
                  onClick={() => setSize(s)}
                >
                  {lang === "ru" ? s.label_ru : s.label_uz}
                  {s.price > 0 ? ` +${fmtMoney(s.price)}` : ""}
                </button>
              ))}
            </div>
          </div>
          <div className="opt-block">
            <div className="opt-title">{t("product:extras")}</div>
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
                    {lang === "ru" ? ex.label_ru : ex.label_uz} +
                    {fmtMoney(ex.price)}
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
            <span>{t("product:spicy")}</span>
          </label>
        </div>
        <div className="modal-foot">
          <div className="modal-total">
            {t("checkout:total")}:{" "}
            <b>{fmtMoney(Number(product?.price || 0) + delta)}</b>
          </div>
          <Button
            className="btn--primary"
            onClick={() => {
              onConfirm({ size, spicy, extras, _priceDelta: delta });
              onClose();
            }}
          >
            {t("common:add_to_cart")}
          </Button>
        </div>
      </div>
    </div>
  );
}
