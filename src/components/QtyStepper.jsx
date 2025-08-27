export default function QtyStepper({ value = 1, onChange }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "6px 10px",
      }}
    >
      <button className="btn" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </button>
      <b>{value}</b>
      <button className="btn" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
