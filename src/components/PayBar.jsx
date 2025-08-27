import Button from "./ui/Button";
export default function PayBar({
  label = "To‘lovga o‘tish",
  amount = 0,
  onClick,
}) {
  return (
    <div className="delivery" style={{ position: "sticky", bottom: 0 }}>
      <div className="delivery__inner">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 800 }}>Jami:</span>
          <b style={{ fontSize: 18 }}>{amount.toLocaleString()} so‘m</b>
        </div>
        <Button className="btn--primary" onClick={onClick}>
          {label}
        </Button>
      </div>
    </div>
  );
}
