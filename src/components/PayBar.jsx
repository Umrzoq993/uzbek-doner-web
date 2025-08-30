import Button from "./ui/Button";
import { useT, useMoneyFormatter } from "../i18n/i18n";
import { useLangStore } from "../store/lang";
import { useCart } from "../store/cart";

export default function PayBar({ label, amount = 0, onClick, showItems }) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const fmtMoney = useMoneyFormatter();
  const { items } = useCart();
  const btnLabel =
    label || (lang === "ru" ? "Перейти к оплате" : "To‘lovga o‘tish");
  // Agar showItems true bo'lsa, 2-3 ta mahsulot nomini tilga qarab ko'rsatamiz (UI kengaytirilishi mumkin)
  const preview = (showItems ? items.slice(0, 3) : []).map((it) => {
    const raw = it.raw || it.product || {};
    return lang === "ru"
      ? raw.name_ru || raw.name || it.title || it.name
      : raw.name_uz || raw.name || it.title || it.name;
  });
  return (
    <div className="delivery" style={{ position: "sticky", bottom: 0 }}>
      <div className="delivery__inner">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 800 }}>
              {lang === "ru" ? "Итого" : "Jami"}:
            </span>
            <b style={{ fontSize: 18 }}>{fmtMoney(amount)}</b>
          </div>
          {!!preview.length && (
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {preview.join(", ")}
              {items.length > preview.length ? "…" : ""}
            </div>
          )}
        </div>
        <Button className="btn--primary" onClick={onClick}>
          {btnLabel}
        </Button>
      </div>
    </div>
  );
}
