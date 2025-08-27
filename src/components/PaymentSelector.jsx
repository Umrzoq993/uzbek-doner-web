export default function PaymentSelector({ value = "card", onChange }) {
  const Item = ({ id, title, note, badge, disabled }) => (
    <button
      onClick={() => !disabled && onChange(id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 14,
        border: "2px solid " + (value === id ? "var(--brand)" : "var(--line)"),
        background: "var(--surface)",
        borderRadius: 16,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 800 }}>{title}</div>
        {badge && (
          <span
            style={{
              fontSize: 12,
              color: "#ff3db0",
              border: "1px solid #ffd3f0",
              padding: "2px 8px",
              borderRadius: 9999,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {note && (
        <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
          {note}
        </div>
      )}
    </button>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Item
        id="card"
        title="Karta orqali"
        note="Uzcard, Humo, Visa, MasterCard"
        badge="-2 000 so‘m"
      />
      <Item
        id="cash"
        title="Naqd to‘lov"
        note="Hozircha mavjud emas"
        disabled
      />
    </div>
  );
}
