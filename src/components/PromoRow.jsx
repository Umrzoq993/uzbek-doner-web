import { useState } from "react";
import Button from "./ui/Button";

export default function PromoRow({ value = "", onApply }) {
  const [v, setV] = useState(value);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Promo-kod kiriting (masalan, TEZ3)"
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "12px 14px",
          background: "var(--surface)",
        }}
      />
      <Button className="btn--primary" onClick={() => onApply(v.trim())}>
        Qo‘llash
      </Button>
    </div>
  );
}
